export const styles = {
  '@global': {
    'html, body': {
      width: '100%',
      height: '100%',
      'font-family': 'Geneva, Verdana, sans-serif',
      fontSize: 16,
    },
  },
  wrapper: {
    width: '100%',
    height: '100%',
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
  },
  demoList: {
    overflow: 'auto',
    borderRight: '1px solid #eee',
  },
  hint: {
    padding: 16,
    color: '#060',
  },
  err: {
    padding: 16,
    color: '#600',
  },
  container: {
    position: 'relative',
  },
  link: {
    display: 'block',
    padding: 16,
    textDecoration: 'underlined',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    '&, &:visited, &:hover, &:active': {
      color: '#089',
    },
  },
  linkActive: {
    '&, &:visited, &:hover, &:active': {
      color: '#600',
    },
  },
};
