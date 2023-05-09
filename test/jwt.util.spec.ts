import { JwtUtil } from '../src/util/jwt.util';

describe('JwtUtil', () => {
  let jwtUtil: JwtUtil;
  const generatedJwt = 'jwt';

  beforeEach(() => {
    jwtUtil = new JwtUtil();
  });

  describe('generate', () => {
    it('should generate a new Json Web Token', async () => {
      jest.spyOn(jwtUtil, 'generate').mockImplementation(() => generatedJwt);

      expect(jwtUtil.generate('id')).toBe(generatedJwt);
    });
  });
});