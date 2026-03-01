// TO_REMOVE: auth guarding will be handled somewhere else
'use client';

import withUserGuard from '@/hoc/guards/withUserGuard';
import LoginSection from '@/sections/login/LoginSection';

const LoginPage = () => <LoginSection />;

export default withUserGuard(LoginPage);
