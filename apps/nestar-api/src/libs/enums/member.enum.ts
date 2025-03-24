import { registerEnumType } from '@nestjs/graphql';

export enum MemberType {
	USER = 'USER',
	AGENT = 'AGENT',
	ADMIN = 'ADMIN',
}

export enum MemberStatus {
	ACTIVE = 'ACTIVE',
	BLOCK = 'BLOCK',
	DELETE = 'DELETE',
}

export enum MemberAuthType {
	PHONE = 'PHONE',
	EMAIL = 'EMAIL',
	TELEGRAM = 'TELEGRAM',
}
registerEnumType(MemberType, { name: 'MemberType' });
registerEnumType(MemberStatus, { name: 'MemberStatus' });
registerEnumType(MemberAuthType, { name: 'MemberAuthType' });
