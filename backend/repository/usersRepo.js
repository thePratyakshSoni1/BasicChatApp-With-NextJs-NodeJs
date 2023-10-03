const isUniqueUser = (user, relPathToUsersJsonFile) => {
  const file = require("fs");
  let isNewUniqueUser = true;
  let dataRead = JSON.parse(
    file.readFileSync(relPathToUsersJsonFile).toString()
  );

  // console.log(dataRead)

  dataRead.forEach((it) => {
    if (it.userId === user.mail) {
      isNewUniqueUser = false;
    }
  });

  console.log(">>> Adding user: found unique");
  return isNewUniqueUser;
};

const addUser = (user, relPathToUsersJsonFile) => {
  try {
    if (isUniqueUser(user, relPathToUsersJsonFile)) {
      let dataRead = JSON.parse("{}");
      let file = require("fs");

      dataRead = JSON.parse(file.readFileSync(relPathToUsersJsonFile).toString())
      dataRead.push({
        userId: user.mail,
        password: user.password
      })

      file.writeFileSync(relPathToUsersJsonFile, JSON.stringify(dataRead))

    }
  } catch (e) {
    return JSON.parse(`{
                    "isUserAdded": false,
                    "error": e.message
                }`);
  }
};

function getUser(relPathToUsersJsonFile, userId){
    const file = require("fs");
    let dataRead = JSON.parse(
      file.readFileSync(relPathToUsersJsonFile).toString()
    );

    let resp = undefined
  
    dataRead.forEach((it) => {
      if (it.userId === userId) {
        console.log("returning user: ",it)
        resp = {fetchStatus: "success", userData: it}
      }
    });
  
    return resp ? resp : {error: true, message: "user not found"}

}

module.exports = { isUniqueUser, addUser, getUser };
