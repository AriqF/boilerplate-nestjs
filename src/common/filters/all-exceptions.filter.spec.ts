import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ErrorCode } from '../constants/error-code.enum';
import { ErrorResponse } from '../dto/response.dto';
import { AllExceptionsFilter } from './all-exceptions.filter';

function runFilter(exception: unknown): ErrorResponse {
  let body: ErrorResponse | undefined;
  const json = jest.fn((payload: ErrorResponse) => {
    body = payload;
  });
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', url: '/things', id: 'req-1' }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;

  new AllExceptionsFilter().catch(exception, host);

  expect(status).toHaveBeenCalledTimes(1);
  expect(body).toBeDefined();
  return body as ErrorResponse;
}

describe('AllExceptionsFilter', () => {
  it('maps an HttpException to the error envelope', () => {
    const body = runFilter(new NotFoundException('Thing not found'));

    expect(body).toMatchObject({
      success: false,
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Thing not found',
      errorCode: ErrorCode.NOT_FOUND,
      path: '/things',
      requestId: 'req-1',
    });
    expect(body.errors).toBeUndefined();
  });

  it('flattens class-validator messages from a BadRequestException', () => {
    const body = runFilter(
      new BadRequestException(['name must be a string', 'age must be an int']),
    );

    expect(body.statusCode).toBe(HttpStatus.BAD_REQUEST);
    expect(body.message).toBe('Validation failed');
    expect(body.errorCode).toBe(ErrorCode.VALIDATION_ERROR);
    expect(body.errors).toEqual([
      'name must be a string',
      'age must be an int',
    ]);
  });

  it('honours a custom errorCode carried in the exception payload', () => {
    const body = runFilter(
      new HttpException(
        { message: 'Nope', errorCode: 'CUSTOM_DOMAIN_ERROR' },
        HttpStatus.CONFLICT,
      ),
    );

    expect(body.statusCode).toBe(HttpStatus.CONFLICT);
    expect(body.message).toBe('Nope');
    expect(body.errorCode).toBe('CUSTOM_DOMAIN_ERROR');
  });

  it('maps an unknown error to a 500 without leaking internals', () => {
    const errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    const body = runFilter(new Error('secret db failure'));

    expect(body.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(body.message).toBe('Internal server error');
    expect(body.errorCode).toBe(ErrorCode.INTERNAL_ERROR);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    errorSpy.mockRestore();
  });
});
