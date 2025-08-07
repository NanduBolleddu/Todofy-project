<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Todofy</title>
    <!-- Corrected Link to our custom CSS, which is now styles.css -->
    <link rel="stylesheet" href="${url.resourcesPath}/styles.css">
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <h1 class="title">
                <span class="welcome-text-part">Welcome to</span><br>Todofy !!
            </h1>
            <form id="kc-form-login" action="${url.loginAction}" method="post">
                <input type="text" id="username" name="username" placeholder="${msg("username")}" class="input" autofocus value="${(login.username!'')}">
                <input type="password" id="password" name="password" placeholder="${msg("password")}" class="input">
                <input type="hidden" id="id-hidden-input" name="credentialId" value="">
                <button type="submit" id="kc-login" class="button">${msg("doLogIn")}</button>
            </form>
            <div class="links-container">
                <#if realm.resetPasswordAllowed>
                    <a href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                </#if>
                <#if realm.registrationAllowed>
                    <a href="${url.registrationUrl}">${msg("doRegister")}</a>
                </#if>
            </div>
        </div>
    </div>
</body>
</html>
