// src/components/LoginPage.js
// Premium login page using Inter font, glassmorphism, micro-animations
export function loginPage() {
  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value;
    const idempotencyKey = createIdempotencyKey();
    try {
      const response = await api.post('/api/v1/auth/login', {
        email,
        password,
        idempotencyKey,
      });
      // Assume response contains user object
      state.user = response.data.user;
      state.authenticated = true;
      navigate(routes.dashboard);
      toast('Welcome back!');
    } catch (e) {
      const err = e instanceof ApiError ? e.message : 'Login failed';
      const msgDiv = document.getElementById('login-form-message');
      if (msgDiv) msgDiv.textContent = err;
    }
  };

  return `
    <section class="card form-card login-card">
      <h1 class="login-title">Welcome to SYNASE AI</h1>
      <form id="login-form" onsubmit="${handleSubmit.toString()}">
        <div class="field full">
          <label for="email">Email</label>
          <input id="email" name="email" type="email" required placeholder="you@example.com" />
        </div>
        <div class="field full">
          <label for="password">Password</label>
          <input id="password" name="password" type="password" required placeholder="••••••••" />
        </div>
        <div id="login-form-message" class="form-message"></div>
        <div class="form-actions">
          <button type="submit" class="button primary">Log in</button>
        </div>
      </form>
    </section>
  `;
}
