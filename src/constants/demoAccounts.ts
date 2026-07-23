import type { DemoAccount } from '@/types/common/DemoAccount'
import { ROLES } from '@/constants/roles'

/**
 * 로그인 화면에 노출하는 데모 계정 목록. 클릭 시 자동 로그인에 사용된다.
 */
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { roleLabel: ROLES.ADMIN, email: 'admin01@core-bridge.co.kr', password: 'qwer1234' },
  { roleLabel: ROLES.RECRUITER, email: 'recruiter01@core-bridge.co.kr', password: 'qwer1234' },
  { roleLabel: ROLES.INTERVIEWER, email: 'interviewer01@core-bridge.co.kr', password: 'qwer1234' },
  { roleLabel: ROLES.APPLICANT, email: 'lesw1216@gmail.com', password: 'qwer1234' },
]
