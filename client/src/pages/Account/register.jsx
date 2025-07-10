import React, { useState } from 'react';

const RegistrationForm = () => {
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  // Errors state
  const [errors, setErrors] = useState({});

  // Handle input change and update state dynamically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validate inputs
  const validate = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';

    // Email regex check (simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email)) newErrors.email = 'Valid email required.';

    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required.';

    if (!formData.gender) newErrors.gender = 'Please select gender.';

    if (!formData.password || formData.password.length < 6) 
      newErrors.password = 'Password must be at least 6 characters.';
    
    // if (formData.password !== formData.confirmPassword) 
    //   newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // if (!validate()) return;
  
    try {

      console.log("Making Register Post Request")
      const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        console.error('Server Error:', data.error);
        alert('❌ ' + data.error);
      } else {
        console.log('✅ Success:', data);
        alert('✅ Registered successfully!');
      }
  
    } catch (error) {
      console.error('💥 Network error:', error);
      alert('💀 Something went wrong!');
    }
  };
  
  

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Register</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* First Name */}
        <label htmlFor="firstName">First Name *</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          style={errors.firstName ? styles.inputError : styles.input}
        />
        {errors.firstName && <div style={styles.error}>{errors.firstName}</div>}

        {/* Last Name */}
        <label htmlFor="lastName">Last Name *</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          style={errors.lastName ? styles.inputError : styles.input}
        />
        {errors.lastName && <div style={styles.error}>{errors.lastName}</div>}

        {/* Email */}
        <label htmlFor="email">Email Address *</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          style={errors.email ? styles.inputError : styles.input}
        />
        {errors.email && <div style={styles.error}>{errors.email}</div>}

        <label htmlFor="phone">Phone Number *</label>
        <input
          type="number"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          style={errors.phone ? styles.inputError : styles.input}
        />
        {errors.phone && <div style={styles.error}>{errors.phone}</div>}

        {/* Date of Birth */}
        <label htmlFor="dateOfBirth">Date of Birth *</label>
        <input
          type="date"
          id="dateOfBirth"
          name="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={handleChange}
          style={errors.dateOfBirth ? styles.inputError : styles.input}
        />
        {errors.dateOfBirth && <div style={styles.error}>{errors.dateOfBirth}</div>}

        {/* Gender Dropdown */}
        <label htmlFor="gender">Gender *</label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          style={errors.gender ? styles.inputError : styles.input}
        >
          <option value="">-- Select Gender --</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        {errors.gender && <div style={styles.error}>{errors.gender}</div>}

        {/* Password */}
        <label htmlFor="password">Password *</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={errors.password ? styles.inputError : styles.input}
        />
        {errors.password && <div style={styles.error}>{errors.password}</div>}

        {/* Confirm Password */}
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          style={errors.confirmPassword ? styles.inputError : styles.input}
        />
        {errors.confirmPassword && <div style={styles.error}>{errors.confirmPassword}</div>}

        <button type="submit" style={styles.button}>Register</button>
      </form>
    </div>
  );
};

// Basic styling so your eyes don’t bleed
const styles = {
  container: {
    maxWidth: 400,
    margin: '50px auto',
    padding: 30,
    background: '#f9f9f9',
    borderRadius: 10,
    boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  input: {
    width: '100%',
    padding: '12px 10px',
    margin: '6px 0 20px 0',
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  inputError: {
    width: '100%',
    padding: '12px 10px',
    margin: '6px 0 20px 0',
    borderRadius: 5,
    border: '2px solid #ff4d4f',
    fontSize: 16,
    outline: 'none',
  },
  error: {
    color: '#ff4d4f',
    marginTop: -18,
    marginBottom: 15,
    fontSize: 13,
  },
  button: {
    width: '100%',
    padding: 14,
    fontSize: 18,
    borderRadius: 6,
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: 10,
  }
};

export default RegistrationForm;
