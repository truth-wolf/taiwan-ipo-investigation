import pandas as pd

# Step 1: Read the CSV data
try:
    # Read the CSV file with UTF-8 encoding to handle Chinese characters
    df = pd.read_csv('證券商基本資料.csv', encoding='utf-8')
except FileNotFoundError:
    print("Error: '證券商基本資料.csv' not found in the current directory.")
    exit(1)
except UnicodeDecodeError:
    print("Error: File encoding issue. Please ensure the file is UTF-8 encoded.")
    exit(1)

# Step 2: Data cleaning - Check for data quality
# Check for missing values in '證券商名稱'
if df['證券商名稱'].isnull().any():
    print("Warning: Missing values found in '證券商名稱'. Dropping rows with missing names.")
    df = df.dropna(subset=['證券商名稱'])

# Check for duplicate rows
if df.duplicated().any():
    print("Warning: Duplicate rows found. Dropping duplicates.")
    df = df.drop_duplicates()

# Verify total number of records
initial_record_count = len(df)
print(f"Initial record count: {initial_record_count}")

# Step 3: Extract parent company
def get_parent_company(name):
    """
    Extract parent company name by splitting on the first hyphen.
    If no hyphen, return the entire name (assumed to be the head office).
    """
    parts = name.split('-', 1)  # Split on the first hyphen only
    return parts[0].strip()     # Return the part before hyphen, strip spaces

# Apply the function to create a new 'parent_company' column
df['parent_company'] = df['證券商名稱'].apply(get_parent_company)

# Step 4: Validate parent company names
# Check for empty or invalid parent company names
invalid_names = df[df['parent_company'] == '']
if not invalid_names.empty:
    print("Warning: Empty parent company names found:", invalid_names['證券商名稱'].tolist())

# Step 5: Group by parent_company and count branches
grouped = df.groupby('parent_company').size().reset_index(name='branch_count')

# Step 6: Sort by branch count in descending order
grouped = grouped.sort_values(by='branch_count', ascending=False)

# Step 7: Verify total branch count
total_branch_count = grouped['branch_count'].sum()
if total_branch_count != initial_record_count:
    print(f"Error: Total branch count ({total_branch_count}) does not match initial record count ({initial_record_count}).")
else:
    print(f"Verification passed: Total branch count ({total_branch_count}) matches initial record count.")

# Step 8: Save to a new CSV file
try:
    grouped.to_csv('parent_companies.csv', index=False, encoding='utf-8')
    print("Processing complete. Output saved to 'parent_companies.csv'.")
except Exception as e:
    print(f"Error saving file: {e}")

# Step 9: Display summary
print(f"Total parent companies: {len(grouped)}")
print("Top 5 parent companies by branch count:")
print(grouped.head())