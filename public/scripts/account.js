const submitForm = async (event) => {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);

  try {
    const res = await fetch(form.action, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(formData).toString(),
    });

    if (res.status === 202) {
      alert('Account data updated successfully');
    } else {
      const message = await res.text();
      if (message) alert(message);
    }
    form.reset();
  } catch (err) {
    alert(err.message);
  }
};

window.addEventListener('load', () => {
  document
    .getElementById('form-account')
    .addEventListener('submit', submitForm);

  const logoutBtn = document.getElementById('btn-logout');
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/logout', { method: 'DELETE' });
      if (res.status === 200) {
        window.location.href = '/';
      } else {
        const message = await res.text();
        if (message) alert(message);
      }
    } catch (err) {
      alert(err.message);
    }
  });

  const deleteBtn = document.getElementById('btn-delete');
  deleteBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/account', { method: 'DELETE' });
      if (res.status === 200) {
        window.location.href = '/';
      } else {
        const message = await res.text();
        if (message) alert(message);
      }
    } catch (err) {
      alert(err.message);
    }
  });
});

const btnChat = document.getElementById('go-to-app');
btnChat.addEventListener('click', () => {
  window.location.href = '/app';
});
