package utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Utility class for Database Connection using JDBC.
 */
public class DBContext {

    /* ADAPT THESE TO YOUR LOCAL ENVIRONMENT OR PASS VIA ENV VARS */
    private final String serverName = "localhost";
    private final String dbName = "pharmacy_db";
    private final String portNumber = "3306";
    private final String instance = ""; // For SQL Server, leave empty for MySQL
    private final String userID = "root";
    private final String password = "password";

    /**
     * Get connection to MySQL Database.
     * @return Connection object
     * @throws ClassNotFoundException
     * @throws SQLException
     */
    public Connection getConnection() throws ClassNotFoundException, SQLException {
        // MySQL 8.0+ uses com.mysql.cj.jdbc.Driver
        String url = "jdbc:mysql://" + serverName + ":" + portNumber + "/" + dbName 
                + "?useUnicode=true&characterEncoding=UTF-8&useSSL=false&allowPublicKeyRetrieval=true";
        Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(url, userID, password);
    }

    /* Test connection */
    public static void main(String[] args) {
        try {
            DBContext db = new DBContext();
            Connection conn = db.getConnection();
            if (conn != null) {
                System.out.println("Kết nối cơ sở dữ liệu thành công!");
                conn.close();
            }
        } catch (Exception ex) {
            Logger.getLogger(DBContext.class.getName()).log(Level.SEVERE, null, ex);
            System.err.println("Kết nối thất bại: " + ex.getMessage());
        }
    }
}
