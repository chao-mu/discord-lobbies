#!/usr/bin/env bash

tmp_out=".tmp-commands-index"
final_out="src/commands/autoload/index.ts"

echo "// Autogenerated by scripts/generate-commands.sh" >> $tmp_out

commands=""
for path in `find src/commands/autoload -name "*.ts" ! -name "index.ts"`; do
  pathName=$(basename $path .ts)
  moduleName=$(echo $pathName | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g' | sed 's/ //g')
  echo "import $moduleName from './$pathName';" >> $tmp_out
  commands="$commands$moduleName, "
done

echo "export default [$commands];" >> $tmp_out

mv $tmp_out $final_out
prettier --write $final_out

exit 0
