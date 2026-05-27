<?php

/**
 * This plugin for Moodle is used mamage some services of European University of Tirana.
 *
 * @package    local_student
 * @copyright  2026 European University of Tirana - uet.edu.al
 * @author     Izet Molla
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$local_token = "jhfegiheruyfghiuewyrgfiuwyregiufgwriuygftrwiuygiufytrgwugyfruwyhruigfgbvurwyegfd";
define('AJAX_SCRIPT', true);
require_once(__DIR__ . '/../../../config.php');
$action = required_param('action', PARAM_ALPHANUMEXT);
$token = optional_param('token', '', PARAM_RAW);


allowOnlyIP(["80.78.78.122"]);

if (!$token && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $token = $_SERVER['HTTP_AUTHORIZATION'];
    if (trim(str_replace("Bearer ", "", $token)) != trim($local_token)) {
        echo json_encode(['error' => 'Unauthorized', "message" => "Token is not valid"]);
        exit;
    }



} else {
    echo json_encode(['error' => 'Unauthorized', "message" => "Token is not provided"]);
    exit;
}


$keyword = optional_param('keyword', '', PARAM_RAW);



switch ($action) {
    case 'getUser':
        echo json_encode(getUser());
        break;
    case 'getUsers':
        echo json_encode(getUsers());
        break;
    case 'getOrgUnits':
        echo json_encode(getOrgUnits());
        break;
    case 'getStudents':
        echo json_encode(getStudents());
        break;

    case 'getStudentsBySPids':
        echo json_encode(getStudentsBySPids());
        break;

    case 'getStudentsByDocumentIds':
        echo json_encode(getStudentsByDocumentIds());
        break;
    default:
        echo json_encode(['error' => 'Invalid action', "message" => "Action is not valid"]);
        break;
}


function getStudentsByDocumentIds()
{
    global $DB;
    $documentids = optional_param('ids', '[]', PARAM_RAW);
    $documentids = json_decode($documentids, true);
    if (empty($documentids) || !is_array($documentids)) {
        return ['error' => 'Document IDs are required', "message" => "Document IDs are not provided"];
    }

    list($insql, $params) = $DB->get_in_or_equal($documentids, SQL_PARAMS_QM);
    $students = $DB->get_records_sql("SELECT * FROM athena_users WHERE DOCUMENT_ID $insql", $params);

    return ['data' => array_values($students)];
}


function getStudentsBySPids()
{
    global $DB;
    $spids = optional_param('ids', '[]', PARAM_RAW);
    $document_id = optional_param('document_id', '', PARAM_RAW);
    $spids = json_decode($spids, true);

    if ($document_id && $document_id !== '') {
        $students = $DB->get_records_sql("SELECT * FROM athena_users WHERE DOCUMENT_ID = ?", [$document_id]);
        return [
            "data" => $students,
            "total_rows" => count($students),
        ];
    }

    if ($spids && !empty($spids)) {
        $placeholders = implode(',', array_fill(0, count($spids), '?'));
        $students = $DB->get_records_sql("SELECT * FROM athena_users WHERE SP_ID IN ($placeholders)", $spids);

        return [
            "data" => $students,
            "total_rows" => count($students),
        ];
    } else {
        return ['error' => 'SP IDs are required', "message" => "SP IDs are not provided"];
    }
}


/**
 * Get a user by email.
 *
 * @return object | array
 */
function getUser()
{
    global $DB;
    $email = optional_param('email', '', PARAM_EMAIL);
    $document_id = optional_param('document_id', '', PARAM_RAW);
    if ((!$email || empty($email)) && (!$document_id || empty($document_id))) {
        return ['error' => 'Email or document id is required', "message" => "Email or document id is not provided"];
    }
    $user = null;
    $total_rows = 0;
    if ($email && !empty($email)) {
        $user = $DB->get_record_sql("SELECT * FROM athena_users WHERE EMAIL_UET = ?", [$email]);
        $total_rows = $DB->get_record_sql("SELECT count(*) as count FROM athena_users WHERE EMAIL_UET = ?", [$email]);
    } else if ($document_id && !empty($document_id)) {
        $user = $DB->get_record_sql("SELECT * FROM athena_users WHERE DOCUMENT_ID = ?", [$document_id]);
        $total_rows = $DB->get_record_sql("SELECT count(*) as count FROM athena_users WHERE DOCUMENT_ID = ?", [$document_id]);
    }
    if (!$user) {
        return ['error' => 'User not found', "message" => "User not found"];
    }

    return [
        "data" => $user,
        "total_rows" => isset($total_rows->count) ? $total_rows->count : 0,
    ];
}

/**
 * Get users by keyword.
 *
 * @return array
 */
function getUsers()
{
    global $DB;
    $keyword = optional_param('keyword', '', PARAM_RAW);
    $page = max(0, optional_param('page', 0, PARAM_INT));
    $perpage = optional_param('perpage', 10, PARAM_INT);

    if (!$keyword || $keyword === '') {
        return [
            'data' => [],
            'total_rows' => 0,
            'page' => $page,
            'perpage' => $perpage,
            'total_pages' => 0,
        ];
    }

    $params = ['%' . $keyword . '%', '%' . $keyword . '%', '%' . $keyword . '%', '%' . $keyword . '%', '%' . $keyword . '%', '%' . $keyword . '%', '%' . $keyword . '%'];
    $where = 'CONCAT(FIRSTNAME," ",FATHERSNAME ," ",SURNAME) LIKE ? OR FATHERSNAME LIKE ? OR CONCAT(FIRSTNAME," ",SURNAME) LIKE ? OR SURNAME LIKE ? OR FIRSTNAME LIKE ? OR EMAIL_UET LIKE ? OR DOCUMENT_ID LIKE ?';

    $totalrows = $DB->count_records_sql(
        "SELECT COUNT(*) FROM athena_users WHERE $where",
        $params
    );

    $users = $DB->get_records_sql(
        "SELECT * FROM athena_users WHERE $where",
        $params,
        $page * $perpage,
        $perpage
    );

    return [
        'data' => array_values($users),
        'total_rows' => $totalrows,
        'page' => $page,
        'perpage' => $perpage,
        'total_pages' => $perpage > 0 ? (int) ceil($totalrows / $perpage) : 0,
    ];
}


function getOrgUnits()
{
    global $DB;

    // 'program', TRIM(REGEXP_REPLACE(t.PROGRAM, '\\s*\\([^)]*\\)$', '')),
    $org_units = $DB->get_record_sql("
    SELECT (
    SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'program_old_id', t.PROGRAM_ID,
            'study_level', t.STUDY_LEVEL,
            'program', t.PROGRAM,
            'profile', t.PROGRAM_SPECIALTY,
            'faculty', t.FACULTY,
            'program_id', t.PROGRAM_ID,
            'program_specialty', t.PROGRAM_SPECIALTY
        )
    )
    FROM (
        SELECT DISTINCT
            PROGRAM_ID,
            STUDY_LEVEL,
            PROGRAM,
            PROGRAM_SPECIALTY,
            FACULTY
        FROM athena_users
        ORDER BY STUDY_LEVEL, PROGRAM, PROGRAM_SPECIALTY, FACULTY
    ) AS t
) AS data
    ", []);
    if (!$org_units || !$org_units->data) {
        return ['data' => [], "message" => "Org units not found"];
    }
    $new_data = [];
    $data = json_decode($org_units->data, true);
    foreach ($data as $item) {
        $new_data[] = [
            "program_old_id" => $item["program_old_id"],
            "study_level" => $item["study_level"],
            "program" => trim(preg_replace('/\s*\([^)]*\)$/', '', $item["program"])),
            "profile" => trim(preg_replace('/\s*\([^)]*\)$/', '', $item["profile"])),
            "faculty" => $item["faculty"],
            "program_id" => $item["program_id"],
            "program_name" => $item["program"],
            "program_specialty" => $item["program_specialty"],
        ];
    }

    return [
        "version" => "1.0.0",
        "data" => $new_data,
    ];
}


function getStudents()
{
    global $DB;
    $columns = getAthenaUsersColumns();

    [$page, $perPage] = parseDatatablePagination();

    $keyword = optional_param('keyword', '', PARAM_RAW);
    $filters = parseColumnFilters(optional_param('columnFilters', '[]', PARAM_RAW));
    $sortings = parseSortings(optional_param('sorting', '[]', PARAM_RAW));

    if ($keyword === '') {
        foreach ($filters as $filter) {
            if (!is_array($filter) || ($filter['id'] ?? '') !== 'fullname') {
                continue;
            }
            if (!empty($filter['value'])) {
                $keyword = (string) $filter['value'];
                break;
            }
        }
    }

    $params = [];
    $where = '1=1';

    $filterclause = formatSqlFromFilters($filters, $columns);
    $where .= $filterclause['sql'];
    $params = array_merge($params, $filterclause['params']);

    if ($keyword !== '') {
        $where .= " AND (
            CONCAT(FIRSTNAME,' ',FATHERSNAME,' ',SURNAME) LIKE ? OR
            CONCAT(FIRSTNAME,' ',SURNAME) LIKE ?
        )";
        $params[] = '%' . $keyword . '%';
        $params[] = '%' . $keyword . '%';
    }

    $orderby = formatSqlFromSortings($sortings, $columns);

    $query = "SELECT *, CONCAT(FIRSTNAME,' ',SURNAME) as fullname FROM athena_users WHERE $where";
    $query .= ' ORDER BY ' . $orderby;
    $query .= ' LIMIT ' . (($page - 1) * $perPage) . ', ' . $perPage;

    $students = $DB->get_records_sql($query, $params);
    $totalrows = (int) $DB->count_records_sql(
        "SELECT COUNT(*) FROM athena_users WHERE $where",
        $params
    );

    return [
        'data' => array_values($students),
        'pagination' => buildDatatablePagination($page, $perPage, $totalrows),
    ];
}

/**
 * Read pagination params from datatable / Go proxy query strings.
 *
 * Supports:
 *   - pagination[page], pagination[perPage] (flowtrove frontend)
 *   - page, perPage / perpage / pageSize (Go proxy)
 *
 * @return array{0: int, 1: int} [page, perPage]
 */
function parseDatatablePagination()
{
    $page = optional_param('page', 0, PARAM_INT);
    $perPage = optional_param('perPage', 0, PARAM_INT);

    if ($perPage <= 0) {
        $perPage = optional_param('perpage', 0, PARAM_INT);
    }
    if ($perPage <= 0) {
        $perPage = optional_param('pageSize', 0, PARAM_INT);
    }

    if (isset($_GET['pagination']) && is_array($_GET['pagination'])) {
        $pagination = $_GET['pagination'];
        if (!empty($pagination['page'])) {
            $page = (int) $pagination['page'];
        }
        if (!empty($pagination['perPage'])) {
            $perPage = (int) $pagination['perPage'];
        } else if (!empty($pagination['pageSize'])) {
            $perPage = (int) $pagination['pageSize'];
        }
    }

    $page = $page > 0 ? $page : 1;
    $perPage = $perPage > 0 ? $perPage : 10;

    return [$page, $perPage];
}

/**
 * Pagination block compatible with flowtrove datatable / Go datatable.Pagination.
 *
 * @param int $page 1-based page index
 * @param int $perPage rows per page
 * @param int $total total matching rows
 * @return array<string, int>
 */
function buildDatatablePagination($page, $perPage, $total)
{
    $totalpages = $perPage > 0 ? (int) ceil($total / $perPage) : 0;
    if ($total > 0 && $totalpages === 0) {
        $totalpages = 1;
    }

    return [
        'page' => $page,
        'limit' => $perPage,
        'total' => $total,
        'total_pages' => $totalpages,
        'pageCount' => $totalpages,
    ];
}


/**
 * Parse columnFilters from request (JSON string or PHP array).
 *
 * @return array<int, array<string, mixed>>
 */
function parseColumnFilters($filters = "[]")
{
    if ($filters === 'null') {
        return [];
    }
    $filters = json_decode($filters, true);
    if (!$filters || !is_array($filters)) {
        return [];
    }
    return $filters;
}


/**
 * @param array<int, array<string, mixed>> $filters
 * @param string[] $columns
 * @return array{sql: string, params: array}
 */
function formatSqlFromFilters(array $filters, array $columns)
{
    $sql = '';
    $params = [];
    $allowed = array_flip($columns);
    $aliases = [
        'study_program' => 'program_id',
    ];

    foreach ($filters as $filter) {
        if (!is_array($filter) || empty($filter['id'])) {
            continue;
        }

        $column = strtolower((string) $filter['id']);
        if ($column === 'fullname') {
            continue;
        }
        if (isset($aliases[$column])) {
            $column = $aliases[$column];
        }
        if (!isset($allowed[$column])) {
            continue;
        }

        $columnsql = strtoupper($column);
        $variant = $filter['variant'] ?? '';

        if (strtolower($variant) === 'multiselect' && !empty($filter['values']) && is_array($filter['values'])) {
            $values = array_values(array_filter(array_map('strval', $filter['values']), static function ($value) {
                return $value !== '';
            }));
            if (empty($values)) {
                continue;
            }
            $placeholders = implode(',', array_fill(0, count($values), '?'));
            $sql .= " AND $columnsql IN ($placeholders)";
            foreach ($values as $value) {
                $params[] = $value;
            }
            continue;
        }

        if (!empty($filter['value'])) {
            $sql .= " AND $columnsql LIKE ?";
            $params[] = '%' . $filter['value'] . '%';
        }
    }

    return [
        'sql' => $sql,
        'params' => $params,
    ];
}


/**
 * Parse sorting from request JSON string.
 *
 * @param string $sorting
 * @return array<int, array<string, mixed>>
 */
function parseSortings($sorting = '[]')
{
    if ($sorting === 'null' || $sorting === '' || $sorting === '[]') {
        return [];
    }

    $decoded = json_decode($sorting, true);
    if (!$decoded || !is_array($decoded)) {
        return [];
    }

    return $decoded;
}

/**
 * Build ORDER BY clause from sorting rules.
 *
 * Example: [{"id":"status","desc":false},{"id":"faculty","desc":true}]
 *
 * @param array<int, array<string, mixed>> $sortings
 * @param string[] $columns
 * @return string
 */
function formatSqlFromSortings(array $sortings, array $columns)
{
    $allowed = array_flip($columns);
    $aliases = [
        'study_program' => 'program_id',
    ];
    $parts = [];

    foreach ($sortings as $sort) {
        if (!is_array($sort) || empty($sort['id'])) {
            continue;
        }

        $column = strtolower((string) $sort['id']);
        if (isset($aliases[$column])) {
            $column = $aliases[$column];
        }
        if (!isset($allowed[$column])) {
            continue;
        }

        if ($column === 'fullname') {
            $columnsql = "CONCAT(FIRSTNAME,' ',SURNAME)";
        } else {
            $columnsql = strtoupper($column);
        }

        $direction = !empty($sort['desc']) ? 'DESC' : 'ASC';
        $parts[] = $columnsql . ' ' . $direction;
    }

    return !empty($parts) ? implode(', ', $parts) : 'FIRSTNAME ASC';
}


function getAthenaUsersColumns()
{
    global $DB;
    $columns = $DB->get_fieldset_sql(
        "SELECT LOWER(COLUMN_NAME) FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION",
        ['athena_users']
    );
    $columns[] = 'fullname';

    return $columns;
}


/**
 * Restrict access to requests from allowed IP addresses.
 *
 * @param string|string[] $ips Comma-separated string or list of allowed IPs.
 */
function allowOnlyIP($ips)
{
    if (!is_array($ips)) {
        $ips = preg_split('/\s*,\s*/', (string) $ips, -1, PREG_SPLIT_NO_EMPTY);
    }
    $ips = array_values(array_filter(array_map('trim', $ips)));

    $clientip = get_athena_client_ip();
    if ($clientip === '' || !in_array($clientip, $ips, true)) {
        http_response_code(403);
        echo json_encode([
            'error' => 'Forbidden',
            'message' => 'Your IP is not allowed',
            'ip' => $clientip,
        ]);
        exit;
    }
}

/**
 * Resolve the real client IP (Cloudflare, then Moodle proxy-aware logic).
 *
 * @return string
 */
function get_athena_client_ip()
{
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ip = cleanremoteaddr($_SERVER['HTTP_CF_CONNECTING_IP']);
        if ($ip) {
            return $ip;
        }
    }

    return getremoteaddr('');
}