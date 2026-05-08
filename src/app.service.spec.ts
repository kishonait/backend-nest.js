import { AppService } from './app.service';

describe('AppService', () => {

  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return hello world', () => {

    expect(service.getHello()).toBe('Hello World!');

  });

});