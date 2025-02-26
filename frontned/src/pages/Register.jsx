const Register = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create Your Account</h1>
        
        <form>
          <div className="mb-4">
            <label className="block mb-2">First Name</label>
            <input 
              type="text" 
              name="firstName"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2">Last Name</label>
            <input 
              type="text" 
              name="lastName"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full p-2 rounded"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
