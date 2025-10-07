import Header from '../components/Header'
import Footer from '../components/Footer'
import properties from '../data/properties.json'

export default function Home() {
  return (
    <div>
      <Header />
      <main className="container">
        <section className="hero">
          <h1>Welcome to Final Test Realty</h1>
          <p className="tagline">Your Trusted Real Estate Partner</p>
        </section>
        
        <section className="featured-properties">
          <h2>Featured Properties</h2>
          <div className="properties-grid">
            {properties.slice(0, 3).map(property => (
              <div key={property.id} className="property-card">
                <h3>{property.title}</h3>
                <p className="price">{property.price}</p>
                <p>{property.description}</p>
                <div className="property-details">
                  <span>{property.bedrooms} bed</span>
                  <span>{property.bathrooms} bath</span>
                  <span>{property.sqft} sqft</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}