-- Add is_simulated column to Invoices table to distinguish between real and simulated invoices
-- This is used to track which invoices are from actual sales vs simulator

-- Check if column exists and add if not
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'dbo.Invoices') 
    AND name = 'is_simulated'
)
BEGIN
    ALTER TABLE Invoices 
    ADD is_simulated BIT NOT NULL DEFAULT 0;
    
    PRINT 'Column is_simulated added to Invoices table successfully';
END
ELSE
BEGIN
    PRINT 'Column is_simulated already exists in Invoices table';
END
GO

-- Add index for faster filtering by is_simulated
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Invoices_IsSimulated' AND object_id = OBJECT_ID('Invoices'))
BEGIN
    CREATE NONCLUSTERED INDEX IX_Invoices_IsSimulated
    ON Invoices(is_simulated)
    INCLUDE (invoice_date, total_amount);
    
    PRINT 'Index IX_Invoices_IsSimulated created successfully';
END
ELSE
BEGIN
    PRINT 'Index IX_Invoices_IsSimulated already exists';
END
GO

-- Add comment to explain the column
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Flag to indicate if invoice is from simulator (1) or real sale (0)', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'Invoices',
    @level2type = N'COLUMN', @level2name = N'is_simulated';
GO

PRINT 'Database schema updated successfully for Invoice Management feature';
