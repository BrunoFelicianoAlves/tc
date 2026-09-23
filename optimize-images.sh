#!/usr/bin/env bash
#
# optimize-images.sh
#
# Otimiza as imagens em assets/img:
#   1. Faz backup de tudo antes de mexer em qualquer arquivo
#   2. Redimensiona imagens mais largas que MAX_WIDTH
#   3. Converte .png/.jpg/.jpeg em .webp (qualidade QUALITY)
#   4. Recomprime .webp que já são grandes/com qualidade alta demais
#   5. Atualiza as referências .png/.jpg -> .webp dentro dos arquivos .html do projeto
#
# Rode a partir da RAIZ do repositório (a pasta que contém "assets/", "index.html" etc):
#   cd ~/Documentos/projetos-dev/projetos/tc
#   bash optimize-images.sh --dry-run     # simula, não altera nada, só mostra o que faria
#   bash optimize-images.sh               # aplica de verdade
#
set -uo pipefail

# ---------- CONFIGURAÇÃO ----------
SOURCE_DIR="assets/img"
MAX_WIDTH=1600                 # nenhuma imagem no site precisa ser mais larga que isso
QUALITY=78                     # qualidade do WebP (75-80 é o ponto ideal custo/benefício)
MIN_SIZE_BYTES=30000           # não mexe em arquivos menores que ~30KB (já são pequenos)
EXCLUDE_DIR_PATTERN="favicon"  # pasta(s) a ignorar (ícones não devem virar webp)
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
  esac
done

# ---------- VERIFICAÇÕES INICIAIS ----------
if [ ! -d "$SOURCE_DIR" ]; then
  echo "❌ Não encontrei a pasta '$SOURCE_DIR' a partir daqui."
  echo "   Rode este script a partir da raiz do repositório (onde fica o index.html)."
  exit 1
fi

for cmd in cwebp dwebp identify; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Comando '$cmd' não encontrado."
    echo "   Instale com: sudo apt install webp imagemagick"
    exit 1
  fi
done

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="assets/img_backup_${TIMESTAMP}"
LOG_FILE="optimize-images_${TIMESTAMP}.log"
MAPPING_FILE=$(mktemp)   # linhas "caminho_antigo|caminho_novo" para os arquivos renomeados (png/jpg -> webp)

TOTAL_BEFORE=0
TOTAL_AFTER=0
COUNT_CONVERTED=0
COUNT_RESIZED=0
COUNT_SKIPPED=0

echo "==================================================================="
echo " Otimização de imagens - RecomendoTech"
echo "==================================================================="
if [ "$DRY_RUN" -eq 1 ]; then
  echo "🔎 MODO SIMULAÇÃO (--dry-run): nada será alterado de verdade."
else
  echo "📦 Backup completo será criado em: $BACKUP_DIR"
fi
echo "Largura máxima permitida: ${MAX_WIDTH}px | Qualidade WebP: ${QUALITY}"
echo "==================================================================="
echo ""

# ---------- BACKUP ----------
if [ "$DRY_RUN" -eq 0 ]; then
  echo "📦 Copiando $SOURCE_DIR para $BACKUP_DIR ..."
  cp -r "$SOURCE_DIR" "$BACKUP_DIR"
  echo "✅ Backup concluído."
  echo ""
fi

# ---------- FUNÇÃO AUXILIAR ----------
human_size() {
  # recebe bytes, devolve algo tipo "1.2M" ou "340K"
  numfmt --to=iec-i --suffix=B "$1" 2>/dev/null || echo "${1}B"
}

# ---------- PROCESSAMENTO ----------
while IFS= read -r -d '' file; do

  # pula pastas de favicon
  if [[ "$file" == *"$EXCLUDE_DIR_PATTERN"* ]]; then
    continue
  fi

  size_before=$(stat -c%s "$file" 2>/dev/null || echo 0)

  # pula arquivos já pequenos
  if [ "$size_before" -lt "$MIN_SIZE_BYTES" ]; then
    COUNT_SKIPPED=$((COUNT_SKIPPED + 1))
    continue
  fi

  width=$(identify -format "%w" "${file}[0]" 2>/dev/null || echo 0)
  ext="${file##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  TOTAL_BEFORE=$((TOTAL_BEFORE + size_before))

  case "$ext_lower" in

    png|jpg|jpeg)
      new_file="${file%.*}.webp"
      echo "🔄 Convertendo: $file  (${width}px, $(human_size "$size_before"))"

      if [ "$DRY_RUN" -eq 0 ]; then
        if [ "$width" -gt "$MAX_WIDTH" ] 2>/dev/null; then
          cwebp -quiet -q "$QUALITY" -resize "$MAX_WIDTH" 0 "$file" -o "$new_file"
        else
          cwebp -quiet -q "$QUALITY" "$file" -o "$new_file"
        fi

        if [ -f "$new_file" ]; then
          rm "$file"
          echo "$file|$new_file" >> "$MAPPING_FILE"
          size_after=$(stat -c%s "$new_file")
          TOTAL_AFTER=$((TOTAL_AFTER + size_after))
          COUNT_CONVERTED=$((COUNT_CONVERTED + 1))
          echo "   ✅ $(human_size "$size_before") -> $(human_size "$size_after")"
        else
          echo "   ⚠️  Falha ao converter, arquivo original mantido."
          TOTAL_AFTER=$((TOTAL_AFTER + size_before))
        fi
      else
        COUNT_CONVERTED=$((COUNT_CONVERTED + 1))
      fi
      ;;

    webp)
      needs_resize=0
      if [ "$width" -gt "$MAX_WIDTH" ] 2>/dev/null; then
        needs_resize=1
      fi

      echo "♻️  Recomprimindo: $file  (${width}px, $(human_size "$size_before"))"

      if [ "$DRY_RUN" -eq 0 ]; then
        tmp_png=$(mktemp --suffix=.png)
        tmp_webp=$(mktemp --suffix=.webp)

        dwebp -quiet "$file" -o "$tmp_png" 2>/dev/null

        if [ "$needs_resize" -eq 1 ]; then
          cwebp -quiet -q "$QUALITY" -resize "$MAX_WIDTH" 0 "$tmp_png" -o "$tmp_webp"
        else
          cwebp -quiet -q "$QUALITY" "$tmp_png" -o "$tmp_webp"
        fi

        size_after=$(stat -c%s "$tmp_webp" 2>/dev/null || echo "$size_before")

        # só substitui se realmente ficou menor (evita recomprimir e piorar)
        if [ "$size_after" -gt 0 ] && [ "$size_after" -lt "$size_before" ]; then
          mv "$tmp_webp" "$file"
          TOTAL_AFTER=$((TOTAL_AFTER + size_after))
          [ "$needs_resize" -eq 1 ] && COUNT_RESIZED=$((COUNT_RESIZED + 1))
          echo "   ✅ $(human_size "$size_before") -> $(human_size "$size_after")"
        else
          rm -f "$tmp_webp"
          TOTAL_AFTER=$((TOTAL_AFTER + size_before))
          echo "   ⏭️  Já estava otimizado, mantido como está."
        fi

        rm -f "$tmp_png"
      else
        [ "$needs_resize" -eq 1 ] && COUNT_RESIZED=$((COUNT_RESIZED + 1))
      fi
      ;;

    *)
      TOTAL_AFTER=$((TOTAL_AFTER + size_before))
      ;;
  esac

done < <(find "$SOURCE_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.webp" \) -print0)

# ---------- ATUALIZA REFERÊNCIAS NOS ARQUIVOS HTML ----------
if [ "$DRY_RUN" -eq 0 ] && [ -s "$MAPPING_FILE" ]; then
  echo ""
  echo "🔗 Atualizando referências .png/.jpg -> .webp nos arquivos .html ..."
  while IFS='|' read -r old_path new_path; do
    old_name=$(basename "$old_path")
    new_name=$(basename "$new_path")
    find . -name "*.html" -print0 | xargs -0 sed -i "s|$old_name|$new_name|g"
  done < "$MAPPING_FILE"
  echo "✅ Referências atualizadas."
fi

rm -f "$MAPPING_FILE"

# ---------- RESUMO ----------
echo ""
echo "==================================================================="
echo " RESUMO"
echo "==================================================================="
echo "Convertidas PNG/JPG -> WebP : $COUNT_CONVERTED"
echo "Redimensionadas (WebP)      : $COUNT_RESIZED"
echo "Ignoradas (já pequenas)     : $COUNT_SKIPPED"
echo "Tamanho total ANTES         : $(human_size "$TOTAL_BEFORE")"
echo "Tamanho total DEPOIS        : $(human_size "$TOTAL_AFTER")"
if [ "$TOTAL_BEFORE" -gt 0 ]; then
  ECONOMIA=$(awk "BEGIN{printf \"%.1f\", (1 - $TOTAL_AFTER/$TOTAL_BEFORE) * 100}")
  echo "Economia                    : ${ECONOMIA}%"
fi
if [ "$DRY_RUN" -eq 0 ]; then
  echo ""
  echo "📦 Backup dos arquivos originais em: $BACKUP_DIR"
  echo "   (depois de conferir que está tudo certo, pode apagar essa pasta)"
fi
echo "==================================================================="
