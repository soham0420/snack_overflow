const calculateRegistrationRisk = require("./services/registrationRisk");


const testUser = {
    email: "user@gmail.com",
    typingSpeed: 300,
    captchaPassed: true
};


const result = calculateRegistrationRisk(testUser);


console.log(result);