<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${msg("registerTitle")}</title>
    <!-- Link to our custom CSS, which is now styles.css -->
    <link rel="stylesheet" href="${url.resourcesPath}/styles.css">
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <h1 class="title">
                Register for Todofy !!
            </h1>
            <form id="kc-register-form" action="${url.registrationAction}" method="post">
                <#if realm.registrationEmailAsUsername>
                    <input type="email" id="email" name="email" placeholder="${msg("email")}" class="input" autofocus value="${(register.formData.email!'')}" autocomplete="email">
                <#else>
                    <input type="text" id="username" name="username" placeholder="${msg("username")}" class="input" autofocus value="${(register.formData.username!'')}" autocomplete="username">
                </#if>

                <input type="text" id="firstName" name="firstName" placeholder="${msg("firstName")}" class="input" value="${(register.formData.firstName!'')}" autocomplete="given-name">
                <input type="text" id="lastName" name="lastName" placeholder="${msg("lastName")}" class="input" value="${(register.formData.lastName!'')}" autocomplete="family-name">
                <input type="email" id="email" name="email" placeholder="${msg("email")}" class="input" value="${(register.formData.email!'')}" autocomplete="email">

                <input type="password" id="password" name="password" placeholder="${msg("password")}" class="input" autocomplete="new-password">
                <input type="password" id="password-confirm" name="password-confirm" placeholder="${msg("passwordConfirm")}" class="input" autocomplete="new-password">

                <button type="submit" id="kc-register" class="button">${msg("doRegister")}</button>
            </form>
            <div class="links-container">
                <a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))}</a>
            </div>
        </div>
    </div>
</body>
</html>
