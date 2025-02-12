
function Meme(id, url) {
  this.id = id;
  this.url = url;
}

function Caption(id, text, memeId) {
  this.id = id;
  this.text = text;
  this.memeId = memeId;
}

export { Meme, Caption};