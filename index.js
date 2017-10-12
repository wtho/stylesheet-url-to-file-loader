const loaderUtils = require('loader-utils')

module.exports =  function(content) {
	const callback = this.async();
  const url = loaderUtils.interpolateName(this, '[name].[ext]', { content	});

  // find urls
  const urls = content.match(/url\([^)]*\)/g) || []

  // extract url content
  const innerUrls = urls.map(match => match.replace(/^url\(["|']*/, '').replace(/["|']*\)$/, ''))

  let p = new Promise(res => res(content))
  // chain all url handling linear
  innerUrls.forEach(url => {
    p = p.then(content => handleUrl(content, url, this.loadModule))
  })

  p.then(content => callback(null, content))

}

/**
 * Handles each url found in a stylesheet by loading the file and replacing the
 * string in the stylesheet with the file name defined by the file-loader.
 */
function handleUrl(content, origUrl, loadFile) {
  return new Promise(resolve => {
    const fileLoaderFileName = (origUrl[0] === '~') ? origUrl.slice(1) : origUrl
    // load file through file-loader
    loadFile(fileLoaderFileName, (a,b,c, fileModule) => {
      // get new name, as defined returned object
      const inDeploy = Object.keys(fileModule.assets)[0]
      if (inDeploy && origUrl !== inDeploy) {
        // replace the new name
        content = content.replace(origUrl, inDeploy)
        resolve(content)
      } else {
        resolve(content)
      }
    })
  })
}
