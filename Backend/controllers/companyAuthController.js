// controllers/companyAuthController.js

// Mock database table for companies
const companies = [];

// REGISTER FUNCTION
const registerCompany = (req, res) => {
    const { companyName, email, password } = req.body;

    // 1. Check if the company already exists
    const existingCompany = companies.find(c => c.email === email);
    if (existingCompany) {
        return res.status(400).json({ message: "A company with this email already exists!" });
    }

    // 2. Create the new company
    const newCompany = {
        id: companies.length + 1,
        companyName,
        email,
        password // In a real app, we will hash this using bcrypt!
    };

    // 3. Save to our mock database
    companies.push(newCompany);
    console.log("New company registered:", newCompany);

    res.status(201).json({ message: "Registration successful!", company: newCompany });
};

// LOGIN FUNCTION
const loginCompany = (req, res) => {
    const { email, password } = req.body;

    // 1. Find the company by email
    const company = companies.find(c => c.email === email);
    
    // 2. Check if company exists and password matches
    if (!company || company.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Success! Send back the user data (and later, a JWT token)
    console.log("Company logged in:", company.companyName);
    res.status(200).json({ 
        message: "Login successful!", 
        company: { id: company.id, companyName: company.companyName, email: company.email } 
    });
};

module.exports = {
    registerCompany,
    loginCompany
};