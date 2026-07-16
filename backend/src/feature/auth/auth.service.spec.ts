import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

// Importations de tes entités, DTOs et services annexes
import { UserEntity } from '../../entities/user.entity';
import { ConfirmMailService } from './authMail/corfirmMail.service';
import { newPasswordMailService } from './authMail/newPasswordMail.service';
import { RegisterDto } from '../../shared/dtos/auth/register.dto';
import { MailDto } from '../../shared/dtos/auth/mail.dtos';
import { NewPasswordDto } from '../../shared/dtos/auth/newPassword.dto';

// On mock entièrement bcrypt pour ne pas ralentir les tests unitaires
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: any;
  let jwtService: any;
  let confirmMailService: any;
  let mockNewPasswordMailServiceInstance: any;

  // Création des objets simulés (Mocks)
  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfirmMailService = {
    sendVerificationMail: jest.fn(),
  };

  const mockNewPasswordMailService = {
    sendNewPasswordMail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfirmMailService,
          useValue: mockConfirmMailService,
        },
        {
          // Utilise le même nom de classe (avec le "n" minuscule) utilisé dans ton import/service
          provide: newPasswordMailService,
          useValue: mockNewPasswordMailService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    jwtService = module.get<JwtService>(JwtService);
    confirmMailService = module.get<ConfirmMailService>(ConfirmMailService);
    mockNewPasswordMailServiceInstance = module.get<newPasswordMailService>(newPasswordMailService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Réinitialise les appels pour chaque test
  });

  // ==========================================
  // REGISTRATION
  // ==========================================
  describe('registration', () => {
    const registerDto: RegisterDto = {
      firstname: 'Jean',
      lastname: 'Dupont',
      mail: 'jean@example.com',
      phoneNumber: '+33612345678',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    };

    it('devrait jeter une BadRequestException si les mots de passe ne correspondent pas', async () => {
      const badDto = { ...registerDto, confirmPassword: 'differentPassword' };
      await expect(authService.registration(badDto)).rejects.toThrow(BadRequestException);
    });

    it('devrait jeter une ConflictException si le mail est déjà pris', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, mail: 'jean@example.com' });
      await expect(authService.registration(registerDto)).rejects.toThrow(ConflictException);
    });

    it('devrait créer et retourner un utilisateur avec succès', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const mockCreatedUser = { id: 123, ...registerDto, password: 'hashed_password' };
      userRepository.create.mockReturnValue(mockCreatedUser);
      userRepository.save.mockResolvedValue(mockCreatedUser);
      jwtService.sign.mockReturnValue('verification-token');

      const result = await authService.registration(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { mail: registerDto.mail } });
      expect(userRepository.create).toHaveBeenCalledWith({ ...registerDto, password: 'hashed_password' });
      expect(userRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(confirmMailService.sendVerificationMail).toHaveBeenCalledWith('jean@example.com', 'verification-token');
      expect(result).toEqual(mockCreatedUser);
    });
  });

  // ==========================================
  // VALIDATE ACCOUNT
  // ==========================================
  describe('validateAccount', () => {
    it('devrait valider le compte de l’utilisateur avec succès', async () => {
      jwtService.verify.mockReturnValue({ id: 42 });
      const mockUser = { id: 42, mail: 'test@example.com', isVerified: false };
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateAccount('valid-token');

      expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 42 } });
      expect(mockUser.isVerified).toBe(true);
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ message: 'Utilisateur validé avec succès' });
    });

    it('devrait jeter une NotFoundException si l’utilisateur dans le token n’existe pas', async () => {
      jwtService.verify.mockReturnValue({ id: 99 });
      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.validateAccount('valid-token')).rejects.toThrow(NotFoundException);
    });

    it('devrait jeter une BadRequestException spécifique si le token a expiré', async () => {
      jwtService.verify.mockImplementation(() => {
        const error = new Error('Expired');
        error.name = 'TokenExpiredError';
        throw error;
      });

      await expect(authService.validateAccount('expired-token')).rejects.toThrow(
        new BadRequestException("Le lien de validation a expiré. Veuillez vous connecter sur le site pour demander un nouveau lien.")
      );
    });

    it('devrait jeter une BadRequestException générique pour toute autre erreur de token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(authService.validateAccount('invalid-token')).rejects.toThrow(
        new BadRequestException("Le lien de validation est invalide.")
      );
    });
  });

  // ==========================================
  // VALIDATE USER
  // ==========================================
  describe('validateUser', () => {
    const mockUser = {
      id: 1,
      mail: 'test@example.com',
      password: 'hashedPassword',
      firstname: 'Jean',
    };

    it('devrait retourner l’utilisateur sans son mot de passe si les identifiants sont corrects', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('test@example.com', 'correctPassword');

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { mail: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', 'hashedPassword');
      expect(result).toEqual({ id: 1, mail: 'test@example.com', firstname: 'Jean' });
      expect(result.password).toBeUndefined();
    });

    it('devrait retourner null si l’utilisateur n’est pas trouvé', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await authService.validateUser('notfound@example.com', 'anyPassword');
      expect(result).toBeNull();
    });

    it('devrait retourner null si le mot de passe est incorrect', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser('test@example.com', 'wrongPassword');
      expect(result).toBeNull();
    });
  });

  // ==========================================
  // LOGIN
  // ==========================================
  describe('login', () => {
    it('devrait signer un token, configurer le cookie et renvoyer le payload', async () => {
      const mockUser = { id: 1, mail: 'test@example.com', firstname: 'Jean', isAdmin: false };
      const mockResponse = { cookie: jest.fn() } as unknown as Response;
      
      jwtService.sign.mockReturnValue('signed-jwt-token');

      const result = await authService.login(mockUser, mockResponse);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { mail: 'test@example.com', id: 1, firstname: 'Jean', isAdmin: false },
        { expiresIn: '1h' }
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith('jwt', 'signed-jwt-token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });
      expect(result).toEqual({
        message: 'Connexion réussie',
        user: { mail: 'test@example.com', id: 1, firstname: 'Jean', isAdmin: false }
      });
    });
  });

  // ==========================================
  // SEND MAIL FORGET PASSWORD
  // ==========================================
  describe('sendMailForgetPassword', () => {
    it('devrait signer un token et appeler le service d’envoi de mail', async () => {
      const mailDto: MailDto = { mail: 'test@example.com' };
      jwtService.sign.mockReturnValue('forgot-password-token');

      await authService.sendMailForgetPassword(mailDto);

      expect(jwtService.sign).toHaveBeenCalledWith({ mail: 'test@example.com' }, { expiresIn: '1h' });
      expect(mockNewPasswordMailServiceInstance.sendNewPasswordMail).toHaveBeenCalledWith(
        'test@example.com',
        'forgot-password-token'
      );
    });
  });

  // ==========================================
  // FORGET PASSWORD
  // ==========================================
  describe('forgetPassword', () => {
    it('devrait vérifier le token et renvoyer le payload', async () => {
      const mockPayload = { mail: 'test@example.com' };
      jwtService.verify.mockReturnValue(mockPayload);

      const result = await authService.forgetPassword('some-token');

      expect(jwtService.verify).toHaveBeenCalledWith('some-token');
      expect(result).toEqual(mockPayload);
    });
  });

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================
  describe('changePassword', () => {
    const newPasswordDto: NewPasswordDto = {
      password: 'NewSecurePassword1!',
      confirmPassword: 'NewSecurePassword1!',
    };

    it('devrait jeter une NotFoundException si le token ne contient pas d’email', async () => {
      jwtService.verify.mockReturnValue({}); // Aucun mail dans le payload

      await expect(authService.changePassword(newPasswordDto, 'token')).rejects.toThrow(NotFoundException);
    });

    it('devrait jeter une NotFoundException si l’utilisateur n’existe pas', async () => {
      jwtService.verify.mockReturnValue({ mail: 'unknown@example.com' });
      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.changePassword(newPasswordDto, 'token')).rejects.toThrow(NotFoundException);
    });

    it('devrait jeter une BadRequestException si les mots de passe ne correspondent pas', async () => {
      jwtService.verify.mockReturnValue({ mail: 'jean@example.com' });
      userRepository.findOne.mockResolvedValue({ id: 1, mail: 'jean@example.com' });

      const badDto = { ...newPasswordDto, confirmPassword: 'noMatch' };

      await expect(authService.changePassword(badDto, 'token')).rejects.toThrow(
        new BadRequestException('Les mots de passe ne correspondent pas')
      );
    });

    it('devrait modifier le mot de passe de l’utilisateur avec succès', async () => {
      jwtService.verify.mockReturnValue({ mail: 'jean@example.com' });
      const mockUser = { id: 1, mail: 'jean@example.com', password: 'old_hashed' };
      userRepository.findOne.mockResolvedValue(mockUser);

      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_password');

      await authService.changePassword(newPasswordDto, 'token');

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPasswordDto.password, 'salt');
      expect(mockUser.password).toBe('new_hashed_password');
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
    });
  });

  // ==========================================
  // RESEND VERIFICATION
  // ==========================================
  describe('resendVerification', () => {
    const payload = { id: 123 };

    it('devrait jeter une NotFoundException si l’utilisateur n’existe pas', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(authService.resendVerification(payload)).rejects.toThrow(
        new NotFoundException('Utilisateur introuvable')
      );
    });

    it('devrait jeter une BadRequestException si le compte est déjà vérifié', async () => {
      userRepository.findOne.mockResolvedValue({ id: 123, isVerified: true });

      await expect(authService.resendVerification(payload)).rejects.toThrow(
        new BadRequestException('Votre compte est déjà vérifié.')
      );
    });

    it('devrait régénérer un token et renvoyer l’email de confirmation', async () => {
      const mockUser = { id: 123, mail: 'jean@example.com', isVerified: false };
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('new-verification-token');

      const result = await authService.resendVerification(payload);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 123 } });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 123 }, { expiresIn: '1h' });
      expect(confirmMailService.sendVerificationMail).toHaveBeenCalledWith('jean@example.com', 'new-verification-token');
      expect(result).toEqual({ message: 'Mail de vérification renvoyé avec succès.' });
    });
  });
});