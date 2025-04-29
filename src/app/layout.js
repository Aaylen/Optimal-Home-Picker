export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Optimal Home Picker</title>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          rel="stylesheet"
        />
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
