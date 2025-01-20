import axios from 'axios'

const HQLCMSProjectFragment  = `{
    country
    description
    id: _id
    geolocation {
      lat
      lng
      alt
    }
    methodologies {
      id {
        current
      }
      category
      name
    }
    name
    region
    registry
    url
    registryProjectId
  }`

export async function fetchCMSProject(registry: string, registryProjectId: string) {
    const { data } = await axios.post('https://l6of5nwi.apicdn.sanity.io/v1/graphql/production/default', {
      query: `
          query getCMSProject($registry: String!, $registryProjectId: String!) {
            allProject(
              where: {
                registry: { eq: $registry }
                registryProjectId: { eq: $registryProjectId }
              }
            ) ${HQLCMSProjectFragment}
          }
        `,
      variables: {
        registry,
        registryProjectId,
      },
    })
  
    return data.data.allProject[0]
  }

  
export async function fetchCMSProjects(registry: string) {
  const { data } = await axios.post('https://l6of5nwi.apicdn.sanity.io/v1/graphql/production/default', {
    query: `
        query getCMSProject($registry: String!) {
          allProject(
            where: {
              registry: { eq: $registry }
            }
          ) ${HQLCMSProjectFragment}
        }
      `,
    variables: {
      registry,
    },
  })

  return data.data.allProject
}
