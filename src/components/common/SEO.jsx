// SEO.jsx - Manejo centralizado de meta tags y head
import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = 'Gestor de Comisiones',
  description = 'Sistema de gestión de comisiones para técnicos - Ifrix',
  keywords = 'comisiones, técnicos, gestión, ifrix, reportes',
  author = 'Ifrix',
  themeColor = '#06b6d4',
  children 
}) => {
  const fullTitle = title === 'Gestor de Comisiones' 
    ? title 
    : `${title} | Gestor de Comisiones`;

  return (
    <Helmet>
      {/* Básicos */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Mobile & PWA */}
      <meta name="theme-color" content={themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Ifrix Comisiones" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Ifrix" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {/* Fonts - Cargadas desde React */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" 
        rel="stylesheet" 
      />
      
      {/* Favicon dinámico si lo necesitas */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      
      {/* Children para meta tags adicionales específicos de página */}
      {children}
    </Helmet>
  );
};

// Componentes especializados para cada página
export const OrdersSEO = () => (
  <SEO 
    title="Órdenes"
    description="Gestiona las órdenes de trabajo y calcula comisiones automáticamente"
  />
);

export const TechniciansSEO = () => (
  <SEO 
    title="Técnicos"
    description="Administra los técnicos y sus tasas de comisión"
  />
);

export const ReportsSEO = () => (
  <SEO 
    title="Reportes"
    description="Visualiza reportes de comisiones por técnico y período"
  />
);

export default SEO;
