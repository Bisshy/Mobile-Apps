
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    const status = document.getElementById("cordovaStatus");
    status.textContent = "Cordova is ready app.js is running";
    status.classList.add("ready")
};

function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
   
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
  }
  
 
  
 /*Validation for Sign Up form */
 const usernameInput = document.getElementById("usernameInput");
 const usernameInputError = document.getElementById("usernameInputError");
 const emailInput = document.getElementById("emailInput");
 
 const emailInputError = document.getElementById("emailInputError");
 const phoneInput = document.getElementById("phonenumberInput")
 const phoneInputError = document.getElementById("phonenumberInputError");
 const passwordInput = document.getElementById("passwordInput")
 const passwordInputError = document.getElementById("passwordInputError");
 
 
 usernameInput.addEventListener("input", (e)=>{
   const username = usernameInput.value.trim();
   const pattern = /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/;
   if (!pattern.test(username)) {
     e.preventDefault();
     usernameInputError.textContent= "Username must start with a letter and be 3–16 characters long. Only letters, numbers, and underscore are allowed."
     usernameInputError.classList.add("show");
     usernameInput.classList.add("invalid");
    }else{
      usernameInputError.textContent = "";
      usernameInputError.classList.remove("show");
      usernameInput.classList.remove("invalid")
    }
 });
 
 emailInput.addEventListener("input", (e)=>{
   if(!e.target.checkValidity()){
     emailInputError.textContent="You must use an email address that ends in @sampleCompany.com.";
    emailInputError.classList.add("show");
    emailInput.classList.add("invalid");
   } else {
     emailInputError.textContent = "";
     emailInputError.classList.remove("show");
     emailInput.classList.remove("invalid");
   }
 });
 
 phoneInput.addEventListener("input",(e)=>{
   const phoneNumber = phoneInput.value.trim();
   const pattern = /^(0[789][01]\d{8}|\+234[789][01]\d{8})$/
   if(phoneNumber === ""){
     phoneInputError.textContent = "";
     phoneInputError.classList.remove("show");
     phoneInputError.classList.remove("invalid")
     return;
   };
   if(!pattern.test(phoneNumber)){
     phoneInputError.textContent = "Enter a valid Nigerian Phone number";
     phoneInputError.classList.add("show");
     phoneInput.classList.add("invalid");
   }else{
     phoneInputError.textContent = "";
     phoneInputError.classList.remove("show");
     phoneInput.classList.remove("invalid");
   }
 });
 
 passwordInput.addEventListener("input", (e)=>{
   const password = passwordInput.value.trim();
   const passwordPattern= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
   
   if (password === "") {
  passwordInputError.textContent = "";
  passwordInputError.classList.remove("show");
  passwordInput.classList.remove("invalid");
  return;
}

if (!passwordPattern.test(password))   {
    passwordInputError.textContent =
    "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.";
  
      passwordInputError.classList.add("show");
      passwordInput.classList.add("invalid");
      } else {
      passwordInputError.textContent = "";
      passwordInputError.classList.remove("show");
       passwordInput.classList.remove("invalid");
}
 });
 
 
 /*form submission to local storage*/
 
 const form = document.getElementById("signup");
 const message = document.getElementById("message");
 
 form.addEventListener("submit",(e)=>{
   e.preventDefault();
   const formData = new FormData(form);
   
   const userData = {
     username:formData.get("username").trim(),
     email:formData.get("email").trim(),
     phoneNumber:formData.get("phone").trim(),
     password:formData.get("password").trim()
   };
   localStorage.setItem("userData", JSON.stringify(userData));
message.classList.add("show");
message.textContent = "Registration Successful"
 });
 
 /*login form validation*/
const loginForm = document.getElementById("login");
const loginMessage = document.getElementById("login-message");

const loginSection = document.getElementById("login-form");
const profileSection = document.getElementById("user-profile");

const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profilePhone = document.getElementById("profile-phone");


loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const savedData = localStorage.getItem("userData");

  if (!savedData) {
    loginMessage.textContent =
      "Not a member yet signup";
    return;
  }

  const savedUser = JSON.parse(savedData);

  const formData = new FormData(loginForm);

  const enteredEmail = formData.get("email").trim();
  const enteredPassword = formData.get("password");

  if (
    enteredEmail === savedUser.email &&
    enteredPassword === savedUser.password
  ) {
    loginMessage.textContent = ""
    loginMessage.classList.add("show");
    loginMessage.classList.add("valid");
    
    profileUsername.textContent = savedUser.username;
    profileEmail.textContent = savedUser.email;
    profilePhone.textContent = savedUser.phoneNumber;
    
    loginSection.classList.remove("active");
    profileSection.classList.add("active");
    
    loginForm.reset();

  } else {
    loginMessage.textContent = "Incorrect username or password.";
    loginMessage.classList.add("show");
   loginMessage.classList.add("invalid");
  }
});

const logoutButton = document.getElementById("logoutButton");

logoutButton.addEventListener("click", () => {
  profileSection.classList.remove("active");
  loginSection.classList.add("active");
}); 




