class NotFoundException extends Error {
    constructor(message) {
      super(message);
      this.name = "NotFoundException";
      this.statusCode = 404; // Not Found status code
    }
  }
  
  export default NotFoundException;
  