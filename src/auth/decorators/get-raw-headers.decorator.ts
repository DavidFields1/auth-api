import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface Request extends Express.Request {
	rawHeaders: string[];
}

export const GetRawHeaders = createParamDecorator(
	(data, ctx: ExecutionContext) => {
		const req = ctx.switchToHttp().getRequest<Request>();

		const { rawHeaders } = req;

		return rawHeaders;
	}
);
