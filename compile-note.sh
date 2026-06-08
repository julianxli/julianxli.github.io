#!/bin/sh
set -eu

if [ $# -ne 1 ]; then
  echo "Usage: ./compile-note.sh PROJECT"
  echo "Example: ./compile-note.sh geometry-problem-001"
  echo "Example: ./compile-note.sh geometry/problem-001"
  exit 1
fi

project_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
tex_dir="$project_dir/tex"
notes_dir="$project_dir/notes"

input=$1
input=${input#tex/}
input=${input%/}

tex_file="$tex_dir/$input/main.tex"

if [ ! -f "$tex_file" ]; then
  echo "Cannot find main.tex for project '$input'."
  echo "Expected file: $tex_file"
  exit 1
fi

source_dir="$tex_dir/$input"
build_dir="$source_dir/build"
output_file="$notes_dir/$input.pdf"
output_dir=$(dirname -- "$output_file")

mkdir -p "$build_dir" "$output_dir"

cd "$source_dir"
latexmk -xelatex -synctex=1 -interaction=nonstopmode -file-line-error -outdir="$build_dir" main.tex
cp "$build_dir/main.pdf" "$output_file"

echo "PDF copied to $output_file"
