import fs from 'fs';
import path from 'path';

// Create the team member type
export interface TeamMember {
  name: string;
  title: string;
  institution: string;
  image: string;
  bio: string;
  website: string;
}


export function getTeamMembers() {

  const teamFile = fs.readFileSync(path.join(process.cwd(), 'data', 'team.json'), 'utf8');
  const teamObj = JSON.parse(teamFile);

  const team: TeamMember[] = teamObj.team.map((member: any) => {
    return member as TeamMember;
  });
  return team;

}
