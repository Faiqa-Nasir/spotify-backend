class CustomError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name; // Set the error name to the class name
    }
  }
  
  export default CustomError;
  