#!/usr/bin/env bash
set -euo pipefail

asset_repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
asset_source_dir="$asset_repo_dir/store-assets/source"
asset_output_dir="$asset_repo_dir/store-assets"
asset_work_dir="$(mktemp -d)"
trap 'rm -rf -- "$asset_work_dir"' EXIT

command -v convert >/dev/null || {
  echo "ImageMagick's convert command is required." >&2
  exit 1
}

for asset_icon_size in 32 48 96 128; do
  convert -background none "$asset_source_dir/icon-master.svg" \
    -resize "${asset_icon_size}x${asset_icon_size}!" \
    "$asset_output_dir/icons/icon-${asset_icon_size}.png"
done

convert -background none "$asset_source_dir/card-banner.svg" \
  -resize 220x140! "$asset_work_dir/card-base.png"
convert "$asset_source_dir/marketplace-illustration.png" \
  -crop 768x1003+800+0 +repage -resize 116x140! \
  "$asset_work_dir/card-art.png"
convert "$asset_work_dir/card-base.png" "$asset_work_dir/card-art.png" \
  -geometry +104+0 -composite \
  "$asset_output_dir/banners/card-220x140.png"

render_store_screenshot() {
  local asset_name="$1"
  local asset_capture="$2"
  local asset_source="$3"
  local asset_sidebar_rail="$4"

  convert "$asset_capture" -resize 1280x694! \
    -crop 1280x654+0+20 +repage "$asset_work_dir/${asset_name}-screen.png"
  convert -background none "$asset_source" -resize 1280x800! \
    "$asset_work_dir/${asset_name}-base.png"
  convert "$asset_work_dir/${asset_name}-base.png" \
    "$asset_work_dir/${asset_name}-screen.png" -geometry +0+146 -composite \
    "$asset_work_dir/${asset_name}-composite.png"

  if [[ "$asset_sidebar_rail" == "true" ]]; then
    convert "$asset_work_dir/${asset_name}-composite.png" \
      -fill '#d8a327' -draw 'rectangle 1096,146 1099,799' \
      "$asset_output_dir/screenshots/${asset_name}-1280x800.png"
  else
    cp "$asset_work_dir/${asset_name}-composite.png" \
      "$asset_output_dir/screenshots/${asset_name}-1280x800.png"
  fi
}

render_store_screenshot \
  "labeloo-sheets-select" \
  "$asset_source_dir/captures/sheets-select-live.png" \
  "$asset_source_dir/screenshot-select.svg" \
  true
render_store_screenshot \
  "labeloo-sheets-map" \
  "$asset_source_dir/captures/sheets-map-live.png" \
  "$asset_source_dir/screenshot-map.svg" \
  true
render_store_screenshot \
  "labeloo-sheets-preview" \
  "$asset_source_dir/captures/sheets-preview-live.png" \
  "$asset_source_dir/screenshot-preview.svg" \
  true
render_store_screenshot \
  "labeloo-editor-result" \
  "$asset_source_dir/captures/editor-live.png" \
  "$asset_source_dir/screenshot-editor.svg" \
  false

echo "Rendered Google Workspace Marketplace assets."
