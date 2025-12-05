import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface TeamInviteEmailProps {
  inviterName?: string;
  inviterEmail?: string;
  teamName?: string;
  inviteLink?: string;
  role?: string;
}

export const TeamInviteEmail = ({
  inviterName = 'Team Member',
  inviterEmail = 'member@taskly.com',
  teamName = 'Your Team',
  inviteLink = 'https://taskly.com/invite',
  role = 'Member',
}: TeamInviteEmailProps) => {
  const getRoleDescription = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'You will have full control over the workspace, including creating, updating, and deleting tasks, inviting members, and managing roles.';
      case 'member':
        return 'You can create tasks, update or delete tasks assigned to you, and participate in team conversations.';
      case 'viewer':
        return 'You can view all tasks but cannot create, update, or delete any tasks.';
      default:
        return 'You have been invited to join the team.';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Join {teamName} on Taskly</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>Taskly</Heading>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Heading style={h2}>You're invited to join {teamName}!</Heading>
            
            <Text style={text}>
              <strong>{inviterName}</strong> ({inviterEmail}) has invited you to join their team on Taskly.
            </Text>

            <Section style={roleSection}>
              <Text style={roleTitle}>Your Access Level: <strong>{role}</strong></Text>
              <Text style={roleDescription}>
                {getRoleDescription(role)}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={inviteLink}>
                Accept Invitation
              </Button>
            </Section>

            <Text style={text}>
              Or copy and paste this URL into your browser:
            </Text>
            <Text style={link}>{inviteLink}</Text>

            <Text style={footer}>
              This invitation was intended for you. If you did not expect this invitation, you can ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TeamInviteEmail;

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
  backgroundColor: '#1a1a1a',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0',
  padding: '0',
  letterSpacing: '-0.5px',
};

const content = {
  padding: '0 48px',
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0 20px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '16px 0',
};

const roleSection = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const roleTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 8px 0',
};

const roleDescription = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#1a1a1a',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#a855f7',
  fontSize: '14px',
  textDecoration: 'underline',
  wordBreak: 'break-all' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '32px 0 0',
};
