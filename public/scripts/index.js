window.addEventListener('load', () => {
  const btnLogin = document.getElementById('btn-login');
  btnLogin.addEventListener('click', () => {
    window.location.href = '/login';
  });

  const btnSignup = document.getElementById('btn-signup');
  btnSignup.addEventListener('click', () => {
    window.location.href = '/signup';
  });
});
