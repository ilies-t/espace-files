const fs = require('fs');

/**
 * Delete a file contains import mistakes from @truffle/hdwallet-provider package.
 *
 * @see https://github.com/trufflesuite/ganache/issues/465
 */
const deleteImportMistake = (originalPath) => {

  const path = `./node_modules/${originalPath}`;

  // check that file exits before deleting
  if (fs.existsSync(path)) {
    fs.unlink(path, (err) => {
      if (err) {
        console.error(`${originalPath} file cannot be deleted`);
        console.error(err);
        return null;
      }
      console.log(`${originalPath} file successfully removed`);
    });
  } else {
    console.log(`${originalPath} file doesn't exists`);
  }
};

deleteImportMistake('@truffle/hdwallet-provider/dist/index.d.ts');