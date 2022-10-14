#!/bin/bash

echo $1
echo $2
wget -q $1 -O $TMP_DIR/$2.run \
&& chmod a+x $TMP_DIR/$2.run \
&& ls -la $TMP_DIR \
&& $TMP_DIR/$2.run --script $TMP_DIR/install-scripts/$2/autoinstall.js --verbose \
&& chmod -Rf 755 $TOOLS_HOME/$2 \
&& rm -Rf $TMP_DIR/$2.run