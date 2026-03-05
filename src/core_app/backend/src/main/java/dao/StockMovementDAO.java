package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/**
 * DAO for managing stock movements (logging inventory changes)
 */
public class StockMovementDAO {

    /**
     * Log a stock movement
     * 
     * @param inventoryId    ID of the inventory record
     * @param type           Type of movement (BÁN HÀNG, NHẬP HÀNG)
     * @param quantityChange Amount of change (negative for sales)
     * @param conn           Use existing connection for transaction safety
     * @throws SQLException
     */
    public void logMovement(int inventoryId, String type, int quantityChange, Connection conn) throws SQLException {
        String sql = "INSERT INTO stock_movements (inventory_id, type, quantity_change) VALUES (?, ?, ?)";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, inventoryId);
            ps.setString(2, type);
            ps.setInt(3, quantityChange);
            ps.executeUpdate();
        }
    }
}
