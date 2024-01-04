import Layout from '../components/layout'
import { TeamMember, getTeamMembers } from '../lib/team'
import { GetStaticProps } from 'next'


export default function About({ teamMembers }: { teamMembers: TeamMember[] }) {

  return (
    <>
      <Layout>
        <section className="container mx-auto py-4">
          <div>
            <h1 className='text-4xl py-4 font-bold'>Great Plains Extended Network of GPUs for Interactive Experimenters (GP-ENGINE)</h1>
            <p className='pb-4'>
              The GP-ENGINE project advances the adoption of advanced computing and data resources in the Great Plains Network region. This project will increase the number of researchers and students served by both local and national computing resources, strengthen the capacity and capabilities of campus research computing professionals, and expand the regional capacity for research. Researchers will be able to transition nascent ideas and codes into advanced computing code using locally provisioned advanced computing resources. These codes can be later executed on national high-throughput computing resources. These successes will enhance institutional buy-in for sustainable regional and national research computing systems.
            </p>
            <p>
              The project leverages strong existing collaborations to provision and manage graphics processing unit resources in Missouri, North Dakota, South Dakota, Kansas, Oklahoma, and Arkansas. It trains and supports researchers to adapt their workbench codes into high-throughput computing codes that can be executed on national platforms such as the Open Science Grid and the National Research Platform. The project addresses computing needs of a diverse set of science drivers from across the consortium, including problems in 3D protein molecule generation, satellite image deep learning for wildfire burn area mapping, dark matter and neutrino detection, real-time monitoring of land surface phenology, cybersecurity attack graph generation, and intelligent manufacturing with digital twins. The project improves STEM research and education through adoption of JupyterLab computing notebooks. The deployed cyberinfrastructure supports research and education in a region whose sparse population and geographic size are ideal for developing advanced computing, data, and networking in under-resourced EPSCoR states.
            </p>
          </div>
        </section>
        <section className="mx-auto py-4 bg-gray-100">
          <div className='container mx-auto'>
            <h1 className='text-4xl py-4 font-bold'>Meet The Team</h1>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
              {teamMembers.map((member) => (
                <div className="flex gap-8 items-center rounded bg-white p-6">
                  <img src={member.image} alt={member.name} className="rounded-full object-scale-down w-32 h-32" />
                  <div className="">
                    <h2 className="text-xl font-bold">{member.name}</h2>
                    <p className="text-sm font-thin">{member.institution}</p>
                    <p className="text-sm capitalize">{member.title}</p>

                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Layout>
    </>
  )
}


export const getStaticProps: GetStaticProps = async () => {

  const teamMembers = getTeamMembers();
  return {
    props: {
      teamMembers
    },
  };
};

