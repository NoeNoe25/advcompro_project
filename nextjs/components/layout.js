
import NavigationBar from "./NavigationBar";

export default function Layout({ children }) {
    return (
      <>
        <div />
            <NavigationBar />
            <main>{children}</main>
           
        <div />
      </>
    )
  }

  