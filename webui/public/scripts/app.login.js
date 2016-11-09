/*
The MIT License (MIT)
Copyright (c) 2015 Aaron Rau

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

app.Ext(app,{Login:function(params,callback){
		var Login ={}

		var completeLogin = callback;

		//Private Property
		var _data = {};
		var _params = null;
		var _mode = 'login'; // login
		var _isOAuthOnly = false;
		var elm = cELM('div','login');


		if(typeof params === 'object')
		{
			if(params.mode)
				_mode = params.mode;

			if(params.isOAuthOnly)
				_isOAuthOnly = params.isOAuthOnly;

			_params = params;

		}
		else if(typeof params === 'string')
		{
			_mode = params; // type
		}

		var onLoginSignUp = function(e)
		{
			msgArea.innerHTML = "";
			
			var p = window.location.href;
			if(p.indexOf('/auth/') == -1 
				&& p.indexOf('/login') == -1 
				&& p.indexOf('/signup') == -1)
				setCookie('lastLoginPath',p,325);
			else
				setCookie('lastLoginPath',null,325);
		}


		var txtUsername = cELM('INPUT');
		txtUsername.id = "txtUsername";
		txtUsername.setAttribute("type", "text");
		txtUsername.setAttribute("placeholder", "Email");

		var txtPassword = cELM('INPUT');
		txtPassword.id = "txtPassword";
		txtPassword.setAttribute("type", "password");
		txtPassword.setAttribute("placeholder", "Password");

		var txtFullname = cELM('INPUT');
		txtFullname.setAttribute("type", "text");
		txtFullname.setAttribute("placeholder", "Name");
		txtFullname.style.display = 'none';


		var txtTitle = cELM('DIV','txtTitle');
		var txtNote = cELM('DIV','txtNote');

		var msgArea = cELM('DIV','error_message');
	
		var btForgot = cELM('DIV','textButton');
		btForgot.id = "btForgot";
		btForgot.innerHTML = "Forgot your password?"

		var btSwitch = cELM('DIV','textButton');
		btSwitch.id = "btSwitch";

		var btAction = cELM('DIV','button');
		btAction.id = "btAction";

		var aSocialLogin = cELM('DIV','social');


		var btGmail = cELM('a','button');
		btGmail.id = "btGmailLogin";
		btGmail.onclick = function(e)
		{
			onLoginSignUp();

			Login.show(false);

			setTimeout(function(){
				location.href = '/auth/google';
			},200)
		}

		var btFacebook = cELM('a','button');
		btFacebook.id = "btFacebookLogin";
		//btFacebook.href = '/auth/facebook';
		btFacebook.onclick = function(e)
		{

			onLoginSignUp();

			Login.show(false);

			setTimeout(function(){
				location.href = '/auth/facebook';
			},200)
		}
		var btTwitter = cELM('a','button');
		btTwitter.id = "btTwitterLogin";
		//btTwitter.href = '/auth/twitter';
		btTwitter.onclick = function(e)
		{
			onLoginSignUp();

			Login.show(false);
			setTimeout(function(){
				location.href = '/auth/twitter';
			},200)
		}

		btFacebook.innerHTML = "with Facebook";
		btTwitter.innerHTML = "with Twitter";
		btGmail.innerHTML = "with Google"

		var swithMode = function(m)
		{
			_mode = m;
			txtNote.innerHTML = "";
			msgArea.innerHTML = "";
			txtUsername.style.visibility = 'visible';

 			if(_mode == "forgot")
			{
				aSocialLogin.style.display ='none';

				elm.className = "login forgot";

				txtTitle.innerHTML = "Reset Password";
				mode = "forgot";
				btAction.innerHTML = 'Reset Password';
				btSwitch.innerHTML = 'or login';
				btForgot.style.visibility = 'hidden';
				btForgot.style.display = 'none';
				txtPassword.style.visibility = 'hidden';
			}
			else if(_mode == "login")
			{
				
				aSocialLogin.style.display ='block';

				elm.className = "login";

				txtTitle.innerHTML = "Please Login";
				_mode = "login";
				btAction.innerHTML = 'Login';
				btSwitch.innerHTML = 'or signup now';
				btForgot.style.visibility = 'visible';

				btForgot.style.display = 'block';
				txtPassword.style.visibility = 'visible';
				Login.showControls(true);


			}
			else if(_mode == "signup")
			{
				aSocialLogin.style.display ='block';

				elm.className = "login signup";
				txtTitle.innerHTML = "Please Sign Up";
				_mode = "signup";
				btAction.innerHTML = 'Signup';
				btSwitch.innerHTML = 'or login';
				btForgot.style.display = 'none';
				txtPassword.style.visibility = 'visible';
				Login.showControls(true);
			
				txtFullname.style.display = 'block';

			}
			else if(_mode == "change")
			{
				
			}
			

		}

		btForgot.onclick = function(e)
		{
			swithMode("forgot");
		}

		btAction.onclick = function(e)
		{
			Login.loginOrSignup();
		}
		btSwitch.onclick = function(e)
		{
			if(_mode == "signup")
			{
				swithMode("login");
			}
			else if(_mode =="login")
			{
				swithMode("signup");
			}
			else if(_mode =="forgot")
			{
				swithMode("login");
			}
			
		}

	    window.addEventListener("keypress", function(e) {
	    
	      if(e.keyCode == 13) 
	      {
	        Login.loginOrSignup();
	      }
	    }, false);

		Login.showControls = function(isShow)
		{
			if(isShow)
			{
				btAction.style.visibility = 'visible';
				btSwitch.style.visibility = 'visible';
			}
			else
			{
				btAction.style.visibility = 'hidden';
				btSwitch.style.visibility = 'hidden';
			}
		}
		Login.show = function(isShow)
		{
			elm.style.display = isShow ? 'block' : 'none';
		}
		Login.loginOrSignup = function()
		{
			Login.showControls(false);
			

			var hideControls = function(){
				txtUsername.style.display = 'none';
				txtPassword.style.display = 'none';
				btForgot.style.visibility = 'hidden';
				aSocialLogin.style.display ='none';
			}


			var showControls = function(){
				txtUsername.style.display = 'block';
				txtPassword.style.display = 'block';
				if(_mode != 'forgot')
					btForgot.style.visibility = 'block';

				aSocialLogin.style.display ='block';
			}

			hideControls();
			if(_mode == "signup")
			{
				onLoginSignUp();

				txtTitle.innerHTML = "Signing up </br> </br> Please wait...";

				app.DAL.signUp(txtUsername.value,txtPassword.value,
				function(user){
					completeLogin(user);
				},
				function(error){
					showControls();
					Login.error(error);
				});
			}
			else if (_mode == "login")
			{
				onLoginSignUp();

				txtTitle.innerHTML = "Logging in </br></br> Please wait...";


				app.DAL.login(txtUsername.value,txtPassword.value,
				function(user){
					completeLogin(user);
				},
				function(error){
					showControls();
					Login.error(error);
				});
			}
			else if (_mode == "forgot")
			{
				txtTitle.innerHTML = "Resetting Password...";
				txtUsername.style.visibility = 'hidden';

				setTimeout(function(){
					txtTitle.innerHTML = "Password Reset";
					txtNote.innerHTML = "An email was sent with a link to create a new password. <br/>Don't forget to check your spam folder, if you don't see the email";
					_mode = "signup";
					btSwitch.innerHTML = "Login";
					btSwitch.style.visibility = 'visible';
					
					txtPassword.style.visibility = 'hidden';

				},1000)

			}
		}

		Login.error = function(error)
		{
			swithMode(_mode);
			Login.showControls(true);
			msgArea.innerHTML = error.code + " " + error.message;
		}
		Login.getELM = function()
		{
			return elm;
		}
		Login.getHTML = function()
		{


			elm.addELM(txtTitle);

			if(_params)
			{
				if(_params.google)
					aSocialLogin.addELM(btGmail);
				
				if(_params.facebook)
					aSocialLogin.addELM(btFacebook);
				
				if(_params.twitter)
					aSocialLogin.addELM(btTwitter);

				if(_params.google || _params.facebook || _params.twitter)
				{
					var or = cELM('DIV','loginor');
					or.innerHTML = 'or'
					if(!_isOAuthOnly)
						aSocialLogin.addELM(or);

					elm.addELM(aSocialLogin);
				}

			}


			elm.addELM(txtNote);
			var c = cELM('DIV','');

			if(!_isOAuthOnly)
			{

				if(_params)
					if(_params.hasName)
						c.addELM(txtFullname);
				
				c.addELM(txtUsername);
				c.addELM(txtPassword);
				c.addELM(btForgot);


				
				c.addELM(btAction);
				c.addELM(btSwitch);
				
				elm.addELM(c);

			}

			elm.addELM(msgArea);

			swithMode(_mode);

			return elm;
		}


	return Login;
}});
