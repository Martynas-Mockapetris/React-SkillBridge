import home from './home.json'
import contact from './contact.json'
import discover from './discover.json'
import profile from './profile.json'
import connections from './connections.json'

// Merge all Lithuanian locale files into a single namespace structure
const ltLocales = {
  main: {
    ...home,
    ...contact,
    listings: {
      ...discover.listings,
      // Merge profile translations (filter out comment lines)
      ...Object.fromEntries(
        Object.entries(profile)
          .filter(([key]) => !key.startsWith('//'))
          .map(([key, value]) => [key, value])
      ),
      // Merge connection translations (filter out comment lines)
      ...Object.fromEntries(
        Object.entries(connections)
          .filter(([key]) => !key.startsWith('//'))
          .map(([key, value]) => [key, value])
      )
    }
  }
}

export default ltLocales
