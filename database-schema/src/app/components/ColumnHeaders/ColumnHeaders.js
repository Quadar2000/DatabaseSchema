import styled from "styled-components";

const ColumnHeaders = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 2px solid #eaeaea;
  font-weight: bold;
  text-align: left;

  .header1 {
    flex: 1;
    width: 300px;
  }

  .header1 {
    flex: 2;
    width: 300px;
  }

  .header-actions {
    flex: 0.5;
    text-align: center;
  }
`;

export default ColumnHeaders;