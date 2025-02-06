export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Optimal Home Picker</title>
        <style>
          {`
            body {
              overflow: hidden;
              margin: 0;
              padding: 0;
            }
          `}
        </style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
