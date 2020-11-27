const User = require("../db/User");
const jwt = require("jwt-simple");
const {
  jstSecret
} = require("./secret.js")
var user = async function (ctx, secret = jstSecret, key = "token") {
  var creator = null;
  if (ctx.cookies.get(key)) {
    let token = jwt.decode(ctx.cookies.get(key), secret);
    if (user) {
      creator = await User.findById({
        _id: token
      }).then(doc => {
        return doc;
      });
    } else {
      creator = null;
    }
  } else {
    creator = null;
  }

  return creator;
}
module.exports = user;