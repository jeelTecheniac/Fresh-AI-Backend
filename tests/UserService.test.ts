import { UserService, CreateUserDto, LoginDto } from "../src/services/UserService.js";
import { UserRepository } from "../src/repositories/UserRepository.js";
import { User } from "../src/entities/User.js";

// Mock the UserRepository
jest.mock("../src/repositories/UserRepository.js");
jest.mock("../src/utils/logger.js", () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser: Partial<User> = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    email: "test@example.com",
    password: "hashedPassword123",
    firstName: "John",
    lastName: "Doe",
    isActive: true,
    isEmailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Create a new instance of UserService
    userService = new UserService();
    
    // Get the mocked repository instance
    mockUserRepository = (userService as any).userRepository;
  });

  describe("createUser", () => {
    const createUserDto: CreateUserDto = {
      email: "newuser@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Smith",
    };

    it("should create a user successfully", async () => {
      // Mock repository methods
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser as User);

      const result = await userService.createUser(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it("should throw error if user already exists", async () => {
      mockUserRepository.findByEmail.mockResolvedValue(mockUser as User);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        "User with this email already exists"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("loginUser", () => {
    const loginDto: LoginDto = {
      email: "test@example.com",
      password: "password123",
    };

    it("should login user successfully with valid credentials", async () => {
      const mockUserWithPassword = {
        ...mockUser,
        validatePassword: jest.fn().mockResolvedValue(true),
      };

      mockUserRepository.findByEmailAndPassword.mockResolvedValue(mockUserWithPassword as User);

      const result = await userService.loginUser(loginDto);

      expect(mockUserRepository.findByEmailAndPassword).toHaveBeenCalledWith(
        loginDto.email,
        loginDto.password
      );
      expect(result.user).toEqual(mockUserWithPassword);
      expect(result.token).toBeDefined();
    });

    it("should throw error for invalid credentials", async () => {
      mockUserRepository.findByEmailAndPassword.mockResolvedValue(null);

      await expect(userService.loginUser(loginDto)).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should throw error for deactivated user", async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUserRepository.findByEmailAndPassword.mockResolvedValue(deactivatedUser as User);

      await expect(userService.loginUser(loginDto)).rejects.toThrow(
        "User account is deactivated"
      );
    });
  });

  describe("getUserById", () => {
    it("should return user by ID", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      mockUserRepository.findById.mockResolvedValue(mockUser as User);

      const result = await userService.getUserById(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const userId = "non-existent-id";
      mockUserRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById(userId);

      expect(result).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = { firstName: "Updated", lastName: "Name" };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserRepository.update.mockResolvedValue(updatedUser as User);

      const result = await userService.updateUser(userId, updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, updateData);
      expect(result).toEqual(updatedUser);
    });

    it("should return null for non-existent user", async () => {
      const userId = "non-existent-id";
      const updateData = { firstName: "Updated" };

      mockUserRepository.update.mockResolvedValue(null);

      const result = await userService.updateUser(userId, updateData);

      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userId = "123e4567-e89b-12d3-a456-426614174000";
      mockUserRepository.softDelete.mockResolvedValue(true);

      const result = await userService.deleteUser(userId);

      expect(mockUserRepository.softDelete).toHaveBeenCalledWith(userId);
      expect(result).toBe(true);
    });

    it("should return false if deletion fails", async () => {
      const userId = "non-existent-id";
      mockUserRepository.softDelete.mockResolvedValue(false);

      const result = await userService.deleteUser(userId);

      expect(result).toBe(false);
    });
  });

  describe("getAllUsers", () => {
    it("should return users with pagination", async () => {
      const users = [mockUser as User];
      const total = 1;
      const limit = 10;
      const offset = 0;

      mockUserRepository.findAll.mockResolvedValue({ users, total });

      const result = await userService.getAllUsers(limit, offset);

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(limit, offset);
      expect(result).toEqual({ users, total });
    });

    it("should use default pagination values", async () => {
      const users = [mockUser as User];
      const total = 1;

      mockUserRepository.findAll.mockResolvedValue({ users, total });

      const result = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalledWith(10, 0);
      expect(result).toEqual({ users, total });
    });
  });

  describe("JWT operations", () => {
    it("should generate JWT token", async () => {
      // Set environment variable for JWT secret
      process.env.JWT_SECRET = "test-secret-key";

      const mockUserForJWT = {
        ...mockUser,
        id: "user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      const token = (userService as any).generateJWT(mockUserForJWT);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });

    it("should throw error if JWT_SECRET is not set", async () => {
      delete process.env.JWT_SECRET;

      const mockUserForJWT = {
        ...mockUser,
        id: "user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      expect(() => {
        (userService as any).generateJWT(mockUserForJWT);
      }).toThrow("JWT_SECRET environment variable is not set");
    });

    it("should verify JWT token successfully", async () => {
      process.env.JWT_SECRET = "test-secret-key";
      const mockUserForJWT = {
        ...mockUser,
        id: "user-id",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      };

      const token = (userService as any).generateJWT(mockUserForJWT);
      const decoded = await userService.verifyJWT(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe("user-id");
      expect(decoded.email).toBe("test@example.com");
    });

    it("should throw error for invalid JWT token", async () => {
      process.env.JWT_SECRET = "test-secret-key";

      await expect(userService.verifyJWT("invalid-token")).rejects.toThrow("Invalid token");
    });
  });
});
