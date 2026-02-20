// js/signup.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');
  if (!form) return;

  const emailInput = document.getElementById('email');
  const roleSelect = document.getElementById('role');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const nameInput = document.getElementById('name');
  const emailError = document.getElementById('emailError');
  const submitBtn = form.querySelector('button[type="submit"]');

  // Real-time email validation (only for students)
  function validateEmail() {
    const email = emailInput.value.trim();
    const role = roleSelect.value;

    emailError.textContent = '';
    emailError.style.display = 'none';

    if (!email) return;

    if (role === 'student' && !email.toLowerCase().endsWith('@aau.edu.et')) {
      emailError.textContent = 'Students must use an official AAU email (@aau.edu.et)';
      emailError.style.display = 'block';
    }
  }

  emailInput.addEventListener('input', validateEmail);
  roleSelect.addEventListener('change', validateEmail);

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    emailError.textContent = '';
    emailError.style.display = 'none';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const role = roleSelect.value;

    let hasError = false;

    // Required fields
    if (!name) {
      alert('Please enter your full name');
      hasError = true;
    }

    if (!email) {
      emailError.textContent = 'Email is required';
      emailError.style.display = 'block';
      hasError = true;
    }

    // Email domain only for students
    if (role === 'student' && !email.toLowerCase().endsWith('@aau.edu.et')) {
      emailError.textContent = 'Students must use an official AAU email (@aau.edu.et)';
      emailError.style.display = 'block';
      emailInput.focus();
      hasError = true;
    }

    // Role validation
    if (!role || (role !== 'student' && role !== 'organizer')) {
      alert('Please select a valid role (Student or Organizer)');
      hasError = true;
    }

    // Password match & length
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      hasError = true;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      hasError = true;
    }

    if (hasError) return;

    // Disable button & show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show backend error in the right place
        if (data.message.includes('AAU') || data.message.includes('email')) {
          emailError.textContent = data.message;
          emailError.style.display = 'block';
          emailInput.focus();
        } else {
          alert(data.message || 'Registration failed');
        }
        return;
      }

      // Success
      alert('Account created successfully! Please login.');
      window.location.href = 'login.html';

    } catch (err) {
      console.error('Signup error:', err);
      alert('Something went wrong. Please try again later.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign Up';
    }
  });
});