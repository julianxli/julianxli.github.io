#!/bin/sh
set -eu

if [ $# -ne 1 ]; then
  echo "Usage: ./compile-note.sh NAME.tex"
  echo "Example: ./compile-note.sh smooth-manifolds.tex"
  echo "Example: ./compile-note.sh typeset-notes/main.tex"
  exit 1
fi

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
tex_dir="$project_dir/tex"
notes_dir="$project_dir/notes"

input=$1
case "$input" in
  tex/*.tex)
    tex_name=${input#tex/}
    ;;
  *.tex)
    tex_name=$input
    ;;
  *)
    tex_name="$input.tex"
    ;;
esac

tex_file="$tex_dir/$tex_name"

if [ ! -f "$tex_file" ]; then
  echo "Cannot find $tex_file"
  exit 1
fi

source_dir=$(CDPATH= cd -- "$(dirname -- "$tex_file")" && pwd)
source_file=$(basename -- "$tex_file")
build_dir="$source_dir/build"

mkdir -p "$build_dir" "$notes_dir"

base_name=${source_file%.tex}
if [ "$base_name" = "main" ] && [ "$source_dir" != "$tex_dir" ]; then
  output_name=$(basename -- "$source_dir")
else
  output_name=$base_name
fi

cd "$source_dir"
latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -outdir="$build_dir" "$source_file"
cp "$build_dir/$base_name.pdf" "$notes_dir/$output_name.pdf"

echo "PDF copied to $notes_dir/$output_name.pdf"
