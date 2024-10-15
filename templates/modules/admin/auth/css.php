<style>
@keyframes color-repeater {
  0% {filter: hue-rotate(0deg);}
  25% {filter: hue-rotate(30deg);}
  50% {filter: hue-rotate(72deg);}
  75% {filter: hue-rotate(100deg);}
  100% {filter: hue-rotate(150deg);}
}


.loginTable{
    table-layout: fixed;
    width: 100%;
    border-spacing: 0;
}
.loginTable .loginTdLeft{
    position: relative;
    text-align: center;
    background-color: rgb(0 0 0);
    box-shadow: 0 0 13px #303030;
    color: #8bbcef;
    text-shadow: 0 0 7px white;
    padding: 0 10%;
    background-image: url('/crm/static/img/login1882023.gif');
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    animation: color-repeater 18s infinite alternate;
}
.loginTable .loginTdLeft h2{
    display: inline-block;
    font-size: 30px;
    font-weight: 100;
    border-bottom: 1px solid #8bbcef;
    padding: 10px 30px;
}
   
    
.loginTable .loginTdRight{
    padding: 10px 0px;
    text-align: center;
    background-color: white;
    overflow: auto;
}
.loginTable .loginTdRight h2{
    display: inline-block;
    font-size: 30px;
    border-bottom: 5px solid var(--blue);
    padding: 10px 30px;
}
.loginTable .loginTdRight input[type=text], .loginTable .loginTdRight input[type=password]{
    outline: 0;
    border: 0;
    border-bottom: 1px solid grey;
    padding: 10px 20px 10px 37px;
    margin: 10px 0;
    font-size: 18px;
    background-repeat: no-repeat;
    background-position: 1% center;
}
.loginTable .loginTdRight input[type=text]{
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>');
}
.loginTable .loginTdRight input[type=password]{
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>');
}
.loginTable .loginTdRight input[type=submit]{
    cursor: pointer;
    transition: 0.2s;
    background-color: var(--blue);
    color: white;
    font-size: 20px;
    padding: 10px 70px;
    margin: 10px 0;
    border: 2px solid white;;
    border-radius: 10px;
    box-shadow: 0 0 5px black;
}
.loginTable .loginTdRight input[type=submit]:hover{
    background-color: white;
    border: 2px solid rgb(38 125 255);
    outline: 0;
    color: black;
}
.loginTable .loginTdRight select{
    outline: 0;
    border: 0;
    border-bottom: 1px solid grey;
    padding: 10px 20px;
    margin-right: 40px;
    font-size: 18px;
}

.loginlogo{
    display: inline-block;
    height: 379px;
    width: 443px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}
.result{color: red;}

.OktagonVerifyIcon{ margin-top: 10px; }
.OktagonVerifyIcon svg{
    width: 22px;
    height: 22px;
    vertical-align: -7px;
}
.OktagonVerifyIcon b{
    color: #1e283a;
    font-size: 12px;
}

@media (max-width: 1199px){
    .loginTdLeft{display: none;}
    .loginlogo{height: 230px;}
}
</style>