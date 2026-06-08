#!/bin/sh
set -eu

if [ $# -ne 1 ]; then
  echo "Usage: ./compile-note.sh NAME.tex"
  echo "Example: ./compile-note.sh smooth-manifolds.tex"
  exit 1
fi

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
tex_dir="$project_dir/tex"
build_dir="$tex_dir/build"
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

mkdir -p "$build_dir" "$notes_dir"

base_name=${tex_name%.tex}

cd "$tex_dir"
latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -outdir="$build_dir" "$tex_name"
cp "$build_dir/$base_name.pdf" "$notes_dir/$base_name.pdf"

echo "PDF copied to $notes_dir/$base_name.pdf"
